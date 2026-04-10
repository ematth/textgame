import { initInput, getDirection, consumeSpacePress, isSpaceDown, consumeZoomDelta, consumeMapToggle, consumeBuildToggle, consumeRightClick, getMousePos, consumeClick, isMouseDown } from './input.js'
import { generateWorld, ensureAreaLoaded, WORLD_W, WORLD_H } from './world.js'
import { createPlayer, tryMovePlayer } from './player.js'
import { computeCameraOrigin } from './camera.js'
import { updateEntities, entityBlocksTile, findInteractTarget } from './entities.js'
import {
  resizeCanvas,
  getGridDimensions,
  getCellSize,
  getZoom,
  setZoom,
  drawBackgroundViewport,
  drawOverlayFull,
  drawOverlayDirty,
  drawNightOverlay,
  currentNightDarkness,
} from './renderer.js'
import { findPath } from './pathfinding.js'
import { drawHud } from './hud.js'
import { toggleBuildingMode, isBuildingMode, placeTile, destroyTile, getSelectedTile } from './building.js'
import { drawBuildingGallery, drawBuildingModeIndicator, drawCursorPreview, GALLERY_PANEL_WIDTH } from './buildingUI.js'
import { TILE_DEFS } from './tiles.js'
import { getTile as worldGetTile } from './world.js'
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

  console.time('generateWorld')
  const { world: overworld } = generateWorld()
  console.timeEnd('generateWorld')
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

  /** @type {{x: number, y: number}[] | null} */
  let movePath = null
  let movePathIdx = 0
  let prevHoverWx = -1
  let prevHoverWy = -1
  let pendingBuildClick = null

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

    // Toggle building mode
    if (consumeBuildToggle() && !dialogText && !mapOpen) {
      toggleBuildingMode()
      forceFullRedraw = true
    }

    // Toggle world map
    if (consumeMapToggle() && !isBuildingMode()) {
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
      consumeClick()
    } else {
      const dir = getDirection()

      if (dir) movePath = null

      tryMovePlayer(
        player,
        dir,
        activeWorld,
        (x, y) => entityBlocksTile(activeWorld, x, y),
        now,
      )

      if (!dir && movePath && movePathIdx < movePath.length && now >= player.nextMoveAt) {
        const step = movePath[movePathIdx]
        const sdx = step.x - player.x
        const sdy = step.y - player.y
        tryMovePlayer(
          player,
          { dx: sdx, dy: sdy },
          activeWorld,
          (x, y) => entityBlocksTile(activeWorld, x, y),
          now,
        )
        if (player.x === step.x && player.y === step.y) {
          movePathIdx++
        } else {
          movePath = null
        }
      }
      if (movePath && movePathIdx >= movePath.length) movePath = null

      if (player.x !== playerOldX || player.y !== playerOldY) {
        const portal = worldManager.checkPortal(activeWorld.id, player.x, player.y)
        if (portal) {
          worldManager.transition(player, portal)
          movePath = null
          forceFullRedraw = true
        }
      }

      const click = consumeClick()
      if (click) {
        if (isBuildingMode()) {
          // Building mode left-click: handled after gallery draw (see below)
          pendingBuildClick = click
        } else {
          const { cellW, cellH } = getCellSize()
          const vc = Math.floor(click.x / cellW)
          const vr = Math.floor(click.y / cellH)
          const twx = camera.ox + vc
          const twy = camera.oy + vr
          const curWorld = worldManager.getActiveWorld()
          const path = findPath(curWorld, player.x, player.y, twx, twy, (x, y) => entityBlocksTile(curWorld, x, y))
          if (path && path.length > 0) {
            movePath = path
            movePathIdx = 0
          }
        }
      }

      // Building mode right-click: destroy tile
      const rclick = consumeRightClick()
      if (rclick && isBuildingMode()) {
        const { cellW, cellH } = getCellSize()
        const rvc = Math.floor(rclick.x / cellW)
        const rvr = Math.floor(rclick.y / cellH)
        const rwx = camera.ox + rvc
        const rwy = camera.oy + rvr
        if (rvc >= 0 && rvr >= 0 && rclick.y > 32) {
          destroyTile(worldManager.getActiveWorld(), rwx, rwy)
          forceFullRedraw = true
        }
      } else if (rclick) {
        // consume right-click when not in building mode (no-op)
      }

      if (consumeSpacePress()) {
        const curWorld = worldManager.getActiveWorld()
        const target = findInteractTarget(curWorld, player.x, player.y)
        if (target) {
          dialogText = buildDialogText(target, now)
          dialogOpenedAt = now
          movePath = null
          if (target.kind === 'npc') {
            target.talkingToPlayer = true
            dialogTarget = target
          }
        }
      }
    }

    const zd = consumeZoomDelta()
    let zoomChanged = false
    let buildScrollDelta = 0
    if (zd !== 0) {
      const mouseNow = getMousePos()
      if (isBuildingMode() && mouseNow.x >= 0 && mouseNow.x < GALLERY_PANEL_WIDTH && mouseNow.y >= 34) {
        buildScrollDelta = -zd
      } else {
        zoomChanged = setZoom(getZoom() + zd)
        if (zoomChanged) {
          grid = getGridDimensions(view.width, view.height)
        }
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

    // --- Building mode gallery + placement ---
    let galleryResult = { clickedInGallery: false, hoveredInGallery: false }
    if (isBuildingMode()) {
      const mouseNow = getMousePos()
      galleryResult = drawBuildingGallery(
        ctx, view.width, view.height,
        mouseNow.x, mouseNow.y,
        pendingBuildClick, null, buildScrollDelta,
      )
      drawBuildingModeIndicator(ctx, view.width)

      // Handle world tile placement if click was not in gallery
      if (pendingBuildClick && !galleryResult.clickedInGallery) {
        const { cellW, cellH } = getCellSize()
        const bvc = Math.floor(pendingBuildClick.x / cellW)
        const bvr = Math.floor(pendingBuildClick.y / cellH)
        if (bvc >= 0 && bvr >= 0 && pendingBuildClick.y > 32) {
          const bwx = camera.ox + bvc
          const bwy = camera.oy + bvr
          placeTile(curWorld, bwx, bwy)
          forceFullRedraw = true
        }
      }
      pendingBuildClick = null

      // Drag-to-place: continuously place tiles while mouse is held down
      if (isMouseDown() && getSelectedTile() >= 0 && !galleryResult.hoveredInGallery) {
        const mouseNow = getMousePos()
        if (mouseNow.x >= 0 && mouseNow.y > 32) {
          const { cellW, cellH } = getCellSize()
          const dvc = Math.floor(mouseNow.x / cellW)
          const dvr = Math.floor(mouseNow.y / cellH)
          const dwx = camera.ox + dvc
          const dwy = camera.oy + dvr
          const currentTile = worldGetTile(curWorld, dwx, dwy)
          if (currentTile !== getSelectedTile()) {
            placeTile(curWorld, dwx, dwy)
            forceFullRedraw = true
          }
        }
      }
    }

    // --- Hover highlight + tooltip ---
    const mouse = getMousePos()
    if (mouse.x >= 0 && mouse.y >= 0) {
      const { cellW, cellH } = getCellSize()
      const hvc = Math.floor(mouse.x / cellW)
      const hvr = Math.floor(mouse.y / cellH)
      const hwx = camera.ox + hvc
      const hwy = camera.oy + hvr

      if (hwx !== prevHoverWx || hwy !== prevHoverWy) forceFullRedraw = true
      prevHoverWx = hwx
      prevHoverWy = hwy

      if (hvc >= 0 && hvc < grid.cols && hvr >= 0 && hvr < grid.rows && mouse.y > 32 && !galleryResult.hoveredInGallery) {
        // Building cursor preview
        if (isBuildingMode()) {
          drawCursorPreview(ctx, cellW, cellH, hvc, hvr, grid.cols, grid.rows)
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.lineWidth = 1
          ctx.strokeRect(hvc * cellW + 0.5, hvr * cellH + 0.5, cellW - 1, cellH - 1)
        }

        const entities = curWorld.spatialHash ? curWorld.spatialHash.getAt(hwx, hwy) : []
        const npc = entities.find(e => e.kind === 'npc' && e.alive)
        const obj = entities.find(e => e.kind === 'object')
        const hoveredEntity = npc || obj

        let tooltipLines = []
        if (hoveredEntity) {
          if (hoveredEntity.kind === 'npc') {
            tooltipLines.push(`${hoveredEntity.name} (${hoveredEntity.race} ${hoveredEntity.role})`)
            tooltipLines.push(`HP: ${hoveredEntity.hp}/${hoveredEntity.maxHp}  ${hoveredEntity.faction.replace('_', ' ')}`)
            tooltipLines.push(`Mood: ${hoveredEntity.mood}`)
          } else {
            tooltipLines.push(hoveredEntity.label || hoveredEntity.char)
          }
        } else {
          const tileId = worldGetTile(curWorld, hwx, hwy)
          const td = TILE_DEFS[tileId] ?? TILE_DEFS[0]
          if (td.name) {
            tooltipLines.push(`${td.char} ${td.name} (${hwx}, ${hwy})`)
          } else if (td.char.trim()) {
            tooltipLines.push(`${td.char} (${hwx}, ${hwy})`)
          }
        }

        if (tooltipLines.length > 0) {
          const tooltipFont = '12px "Courier New", monospace'
          ctx.font = tooltipFont
          const lineH = 16
          const pad = 6
          let maxW = 0
          for (const line of tooltipLines) {
            const w = ctx.measureText(line).width
            if (w > maxW) maxW = w
          }
          const boxW = maxW + pad * 2
          const boxH = tooltipLines.length * lineH + pad * 2
          let tx = mouse.x + 16
          let ty = mouse.y - boxH - 4
          if (tx + boxW > view.width) tx = mouse.x - boxW - 4
          if (ty < 34) ty = mouse.y + 20

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
          ctx.fillRect(tx, ty, boxW, boxH)
          ctx.strokeStyle = '#475569'
          ctx.strokeRect(tx + 0.5, ty + 0.5, boxW - 1, boxH - 1)
          ctx.fillStyle = '#e2e8f0'
          ctx.font = tooltipFont
          ctx.textBaseline = 'top'
          for (let i = 0; i < tooltipLines.length; i++) {
            ctx.fillText(tooltipLines[i], tx + pad, ty + pad + i * lineH)
          }
        }
      }
    }

    // --- Path preview dots ---
    if (movePath && movePathIdx < movePath.length) {
      const { cellW, cellH } = getCellSize()
      ctx.fillStyle = 'rgba(134, 239, 172, 0.35)'
      for (let i = movePathIdx; i < movePath.length; i++) {
        const pvc = movePath[i].x - camera.ox
        const pvr = movePath[i].y - camera.oy
        if (pvc >= 0 && pvc < grid.cols && pvr >= 0 && pvr < grid.rows) {
          ctx.fillRect(pvc * cellW + cellW * 0.3, pvr * cellH + cellH * 0.3, cellW * 0.4, cellH * 0.4)
        }
      }
    }

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

boot().catch(err => {
  console.error('Boot failed:', err)
  const c = document.getElementById('game')
  if (c) {
    const x = c.getContext('2d')
    if (x) {
      x.fillStyle = '#000'
      x.fillRect(0, 0, c.width, c.height)
      x.fillStyle = '#f44'
      x.font = '16px monospace'
      x.fillText('Boot error: ' + err.message, 20, 40)
      x.fillText(String(err.stack).split('\n').slice(0, 5).join(' | '), 20, 70)
    }
  }
})
