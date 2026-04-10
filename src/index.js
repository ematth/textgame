import { initInput, getDirection, consumeSpacePress, isSpaceDown, consumeZoomDelta, consumeMapToggle } from './input.js'
import { generateWorld, ensureAreaLoaded, WORLD_W, WORLD_H } from './world.js'
import { createPlayer, tryMovePlayer } from './player.js'
import { computeCameraOrigin } from './camera.js'
import { updateEntities, entityBlocksTile, findInteractTarget } from './entities.js'
import {
  resizeCanvas,
  getGridDimensions,
  getZoom,
  setZoom,
  drawBackgroundViewport,
  drawOverlayFull,
  drawOverlayDirty,
  drawNightOverlay,
  currentNightDarkness,
} from './renderer.js'
import { drawHud } from './hud.js'
import { createWorldManager } from './worldManager.js'
import { buildSpatialHash } from './spatialHash.js'
import { ensureInterior } from './interiors.js'
import { spawnNPCsForPOI } from './npcFactory.js'
import { drawLoadingScreen, yieldFrame } from './loading.js'
import { DamageQueue } from './combat.js'
import { tickClock, getTimeString, getPhase } from './worldClock.js'
import { MEMORY_DIALOG } from './npcData.js'
import { createWorldMap, drawWorldMap, updateWorldMapCamera } from './worldMap.js'
import { CHUNK_BITS, CHUNK_SIZE } from './chunks.js'
import { BIOME_NAMES, getBiome } from './biomes.js'

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game'))
if (!canvas) throw new Error('#game canvas missing')

let ctx = /** @type {CanvasRenderingContext2D} */ (
  canvas.getContext('2d', { alpha: false, desynchronized: true })
)
if (!ctx) throw new Error('2d context')

async function boot() {
  let view = resizeCanvas(canvas, ctx)

  function show(phase, progress) {
    drawLoadingScreen(ctx, view.width, view.height, phase, progress)
  }

  show('Shaping the continent...', 0)
  await yieldFrame()

  const { world: overworld } = generateWorld()
  show('Shaping the continent...', 0.3)
  await yieldFrame()

  const worldManager = createWorldManager()
  worldManager.registerWorld(overworld)
  worldManager.setActiveWorld('overworld')

  show('Populating settlements...', 0.5)
  await yieldFrame()

  // Generate interiors and NPCs for structures near spawn
  const spawnX = (WORLD_W / 2) | 0
  const spawnY = (WORLD_H / 2) | 0
  setupNearbyStructures(overworld, worldManager, spawnX, spawnY, 300)

  show('Indexing the realm...', 0.8)
  await yieldFrame()

  for (const w of worldManager.allWorlds()) {
    w.spatialHash = buildSpatialHash(w.entities.list)
  }

  show('The gates are open.', 1.0)
  await yieldFrame()
  await new Promise((r) => setTimeout(r, 300))

  startGame(worldManager, overworld, view)
}

function setupNearbyStructures(overworld, worldManager, cx, cy, radius) {
  const portals = []
  const x0 = (cx - radius) >> CHUNK_BITS
  const y0 = (cy - radius) >> CHUNK_BITS
  const x1 = (cx + radius) >> CHUNK_BITS
  const y1 = (cy + radius) >> CHUNK_BITS

  for (let ccy = y0; ccy <= y1; ccy++) {
    for (let ccx = x0; ccx <= x1; ccx++) {
      const chunk = overworld.chunkCache.getOrGenerate(ccx, ccy)
      for (const p of chunk.portals) {
        portals.push(p)
      }
    }
  }

  const processedInteriors = new Set()
  for (const p of portals) {
    if (!p.building) continue
    const bld = p.building
    const intId = `interior_${bld.id}`
    if (processedInteriors.has(intId)) continue
    processedInteriors.add(intId)

    const interior = ensureInterior(bld, worldManager)
    spawnNPCsForPOI(worldManager, bld, interior)
  }
}

// Track which chunks have had their structures initialized
const initializedChunks = new Set()

function ensureChunkStructures(overworld, worldManager, playerX, playerY) {
  const radius = 2
  const pcx = playerX >> CHUNK_BITS
  const pcy = playerY >> CHUNK_BITS

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const ccx = pcx + dx
      const ccy = pcy + dy
      const key = (ccx << 16) ^ ccy
      if (initializedChunks.has(key)) continue
      initializedChunks.add(key)

      const chunk = overworld.chunkCache.getOrGenerate(ccx, ccy)
      for (const p of chunk.portals) {
        if (!p.building) continue
        const bld = p.building
        const intId = `interior_${bld.id}`
        if (worldManager.getWorld(intId)) continue

        const interior = ensureInterior(bld, worldManager)
        spawnNPCsForPOI(worldManager, bld, interior)
        interior.spatialHash = buildSpatialHash(interior.entities.list)
      }
    }
  }
}

function startGame(worldManager, overworld, initialView) {
  const spawnX = (WORLD_W / 2) | 0
  const spawnY = (WORLD_H / 2) | 0
  const player = createPlayer(spawnX + 3, spawnY)

  initInput()

  const damageQueue = new DamageQueue()

  let view = initialView
  let grid = getGridDimensions(view.width, view.height)
  let camera = computeCameraOrigin(player.x, player.y, overworld.width, overworld.height, grid.cols, grid.rows)

  /** @type {string | null} */
  let dialogText = null
  let dialogOpenedAt = 0
  /** @type {any} */
  let dialogTarget = null
  let forceFullRedraw = true
  let mapOpen = false
  const worldMap = createWorldMap(WORLD_W, WORLD_H, overworld.seed)

  window.addEventListener('resize', () => {
    view = resizeCanvas(canvas, ctx)
    grid = getGridDimensions(view.width, view.height)
    forceFullRedraw = true
  })

  let lastTs = performance.now()
  let lastDarkness = currentNightDarkness()
  let lastCols = -1
  let lastRows = -1

  function frame(now) {
    const dt = Math.min(50, now - lastTs)
    lastTs = now

    tickClock(dt)

    const activeWorld = worldManager.getActiveWorld()
    if (!activeWorld) { requestAnimationFrame(frame); return }

    // Toggle world map
    if (consumeMapToggle()) {
      mapOpen = !mapOpen
      forceFullRedraw = true
    }

    if (mapOpen) {
      consumeSpacePress()
      const zd = consumeZoomDelta()
      const dir = getDirection()
      updateWorldMapCamera(worldMap, dir, zd, view.width, view.height)
      drawWorldMap(ctx, worldMap, view.width, view.height, player.x, player.y, overworld.seed)

      requestAnimationFrame(frame)
      return
    }

    // Ensure chunks are loaded around the player
    if (activeWorld.isChunked) {
      ensureAreaLoaded(activeWorld, player.x, player.y, Math.max(grid.cols, grid.rows) + CHUNK_SIZE)
      ensureChunkStructures(activeWorld, worldManager, player.x, player.y)
    }

    const prevOx = camera.ox
    const prevOy = camera.oy
    const playerOldX = player.x
    const playerOldY = player.y

    const visibleNpcs = activeWorld.spatialHash
      ? activeWorld.spatialHash.getInRect(
        camera.ox - 2, camera.oy - 2,
        camera.ox + grid.cols + 2, camera.oy + grid.rows + 2
      ).filter((e) => e.kind === 'npc')
      : []

    const npcSnap = visibleNpcs.map((e) => ({ e, ox: e.x, oy: e.y, hadEmote: !!e.emote }))

    if (dialogText) {
      if (now - dialogOpenedAt > 150 && (consumeSpacePress() || isSpaceDown())) {
        dialogText = null
        if (dialogTarget) {
          dialogTarget.talkingToPlayer = false
          dialogTarget = null
        }
        forceFullRedraw = true
      }
    } else {
      const dir = getDirection()
      tryMovePlayer(
        player,
        dir,
        activeWorld,
        (x, y) => entityBlocksTile(activeWorld, x, y),
        now,
      )

      if (player.x !== playerOldX || player.y !== playerOldY) {
        const portal = worldManager.checkPortal(activeWorld.id, player.x, player.y)
        if (portal) {
          worldManager.transition(player, portal)
          forceFullRedraw = true
        }
      }

      if (consumeSpacePress()) {
        const curWorld = worldManager.getActiveWorld()
        const target = findInteractTarget(curWorld, player.x, player.y)
        if (target) {
          dialogText = buildDialogText(target, now)
          dialogOpenedAt = now
          if (target.kind === 'npc') {
            target.talkingToPlayer = true
            dialogTarget = target
          }
        }
      }
    }

    const zd = consumeZoomDelta()
    let zoomChanged = false
    if (zd !== 0) {
      zoomChanged = setZoom(getZoom() + zd)
      if (zoomChanged) {
        grid = getGridDimensions(view.width, view.height)
      }
    }

    const curWorld = worldManager.getActiveWorld()
    updateEntities(curWorld, player.x, player.y, dt, now, damageQueue, worldManager)
    damageQueue.processAll(now)

    camera = computeCameraOrigin(player.x, player.y, curWorld.width, curWorld.height, grid.cols, grid.rows)

    const nowDarkness = currentNightDarkness()
    const darknessShifted = Math.abs(nowDarkness - lastDarkness) > 0.005

    const cameraChanged = forceFullRedraw || zoomChanged || darknessShifted ||
      camera.ox !== prevOx || camera.oy !== prevOy ||
      grid.cols !== lastCols || grid.rows !== lastRows

    if (cameraChanged) {
      forceFullRedraw = false
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, view.width, view.height)
      drawBackgroundViewport(ctx, curWorld, camera, grid.cols, grid.rows)
      drawNightOverlay(ctx, view.width, view.height)
      drawOverlayFull(ctx, curWorld, camera, player, now, grid.cols, grid.rows)
    } else {
      const dirtySet = new Set()

      addDirtyCell(dirtySet, playerOldX, playerOldY, curWorld)
      addDirtyCell(dirtySet, player.x, player.y, curWorld)

      for (const snap of npcSnap) {
        const { e, ox, oy, hadEmote } = snap
        if (e.x !== ox || e.y !== oy) {
          addDirtyCell(dirtySet, ox, oy, curWorld)
          addDirtyCell(dirtySet, e.x, e.y, curWorld)
          if (hadEmote) addDirtyCell(dirtySet, ox, oy - 1, curWorld)
        }
        if (e.emote || hadEmote) {
          addDirtyCell(dirtySet, e.x, e.y - 1, curWorld)
        }
      }

      if (curWorld.spatialHash) {
        const visObj = curWorld.spatialHash.getInRect(
          camera.ox, camera.oy,
          camera.ox + grid.cols, camera.oy + grid.rows,
        )
        for (const e of visObj) {
          if (e.kind === 'object' && (e.char === '*' || e.isCorpse)) {
            addDirtyCell(dirtySet, e.x, e.y, curWorld)
          }
        }
      }

      /** @type {{wx:number, wy:number}[]} */
      const dirtyCells = []
      for (const key of dirtySet) {
        const wy = (key / curWorld.width) | 0
        const wx = key - wy * curWorld.width
        dirtyCells.push({ wx, wy })
      }

      drawOverlayDirty(ctx, curWorld, camera, player, now, dirtyCells, grid.cols, grid.rows)
    }

    lastDarkness = nowDarkness
    lastCols = grid.cols
    lastRows = grid.rows

    // Biome name for HUD
    let biomeName = ''
    if (curWorld.isChunked) {
      biomeName = BIOME_NAMES[getBiome(player.x, player.y)] || ''
    }

    const target = dialogText ? null : findInteractTarget(curWorld, player.x, player.y)
    const timeStr = `${getPhase().charAt(0).toUpperCase() + getPhase().slice(1)} (${getTimeString()})`
    const worldLabel = curWorld.isChunked ? `${curWorld.name} - ${biomeName}` : curWorld.name
    drawHud(ctx, view.width, view.height, player, worldLabel, dialogText, !!target, timeStr)

    requestAnimationFrame(frame)
  }

  function addDirtyCell(dirtySet, wx, wy, world) {
    if (wx < 0 || wx >= world.width || wy < 0 || wy >= world.height) return
    dirtySet.add(wy * world.width + wx)
  }

  requestAnimationFrame(frame)
}

function buildDialogText(target, now) {
  if (target.kind !== 'npc') {
    return `${target.label}:\n${target.dialog}`
  }

  const n = target
  let header = `${n.name} (${n.race} ${n.role})`
  let details = `${n.gender}, age ${n.age} | ${n.faction.replace('_', ' ')} | Mood: ${n.mood}`
  let stats = `HP: ${n.hp}/${n.maxHp} | ATK: ${n.attack} DEF: ${n.defense}`

  const equipParts = []
  if (n.equipment.weapon) equipParts.push(n.equipment.weapon.name)
  if (n.equipment.armor) equipParts.push(n.equipment.armor.name)
  if (n.equipment.shield) equipParts.push(n.equipment.shield.name)
  if (equipParts.length > 0) stats += `\nEquip: ${equipParts.join(', ')}`

  let memoryLine = ''
  if (n.memory && n.memory.length > 0) {
    const recent = n.memory[n.memory.length - 1]
    const age = now - recent.timestamp
    if (age < 120_000) {
      const pool = MEMORY_DIALOG[recent.type]
      if (pool && pool.length > 0) {
        memoryLine = pool[Math.floor(Math.random() * pool.length)]
      }
    }
  }

  let text = `${header}\n${details}\n${stats}`
  if (memoryLine) text += `\n"${memoryLine}"`
  text += `\n${n.dialog}`
  return text
}

boot()
