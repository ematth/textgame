import { initInput, getDirection, consumeSpacePress, isSpaceDown, consumeZoomDelta } from './input.js'
import { generateWorld } from './world.js'
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
} from './renderer.js'
import { drawHud } from './hud.js'
import { createWorldManager } from './worldManager.js'
import { buildSpatialHash } from './spatialHash.js'
import { generateAllInteriors } from './interiors.js'
import { populateNPCs } from './npcFactory.js'
import { drawLoadingScreen, yieldFrame } from './loading.js'

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

  show('Generating overworld...', 0)
  await yieldFrame()

  const { world: overworld, buildingRegistry, districtMap } = generateWorld()
  show('Generating overworld...', 0.15)
  await yieldFrame()

  const worldManager = createWorldManager()
  worldManager.registerWorld(overworld)
  worldManager.setActiveWorld('overworld')

  show('Furnishing buildings...', 0.25)
  await yieldFrame()

  const interiors = generateAllInteriors(buildingRegistry, worldManager)
  show('Furnishing buildings...', 0.45)
  await yieldFrame()

  for (const interior of interiors) {
    worldManager.registerWorld(interior)
  }

  show('Summoning citizens...', 0.55)
  await yieldFrame()

  populateNPCs(worldManager, districtMap, buildingRegistry)
  show('Summoning citizens...', 0.75)
  await yieldFrame()

  // Build spatial hashes for all worlds
  show('Indexing the realm...', 0.8)
  await yieldFrame()

  for (const w of worldManager.allWorlds()) {
    w.spatialHash = buildSpatialHash(w.entities.list)
  }

  show('The gates are open.', 1.0)
  await yieldFrame()

  // Small delay so user sees "100%"
  await new Promise((r) => setTimeout(r, 300))

  startGame(worldManager, overworld, view)
}

function startGame(worldManager, overworld, initialView) {
  const cx = (overworld.width / 2) | 0
  const cy = (overworld.height / 2) | 0
  const player = createPlayer(cx + 3, cy)

  initInput()

  let view = initialView
  let grid = getGridDimensions(view.width, view.height)
  let camera = computeCameraOrigin(player.x, player.y, overworld.width, overworld.height, grid.cols, grid.rows)

  /** @type {string | null} */
  let dialogText = null
  let dialogOpenedAt = 0
  let forceFullRedraw = true

  window.addEventListener('resize', () => {
    view = resizeCanvas(canvas, ctx)
    grid = getGridDimensions(view.width, view.height)
    forceFullRedraw = true
  })

  let lastTs = performance.now()
  let lastOx = camera.ox
  let lastOy = camera.oy
  let lastCols = -1
  let lastRows = -1

  function addDirtyCell(dirtySet, wx, wy, world) {
    if (wx < 0 || wx >= world.width || wy < 0 || wy >= world.height) return
    dirtySet.add(wy * world.width + wx)
  }

  function frame(now) {
    const dt = Math.min(50, now - lastTs)
    lastTs = now

    const activeWorld = worldManager.getActiveWorld()
    if (!activeWorld) { requestAnimationFrame(frame); return }

    const prevOx = camera.ox
    const prevOy = camera.oy

    const playerOldX = player.x
    const playerOldY = player.y

    // Snapshot visible NPC positions for dirty tracking (via spatial hash)
    const visibleNpcs = activeWorld.spatialHash
      ? activeWorld.spatialHash.getInRect(
        camera.ox - 2, camera.oy - 2,
        camera.ox + grid.cols + 2, camera.oy + grid.rows + 2
      ).filter((e) => e.kind === 'npc')
      : []

    const npcSnap = visibleNpcs.map((e) => ({ e, ox: e.x, oy: e.y }))

    if (dialogText) {
      if (now - dialogOpenedAt > 150 && (consumeSpacePress() || isSpaceDown())) {
        dialogText = null
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

      // Check portal after movement
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
          dialogText = target.kind === 'npc'
            ? `${target.name} (${target.race} ${target.role}):\n${target.dialog}`
            : `${target.label}:\n${target.dialog}`
          dialogOpenedAt = now
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
    updateEntities(curWorld, player.x, player.y, dt, now)

    camera = computeCameraOrigin(player.x, player.y, curWorld.width, curWorld.height, grid.cols, grid.rows)

    const cameraChanged = forceFullRedraw || zoomChanged ||
      camera.ox !== prevOx || camera.oy !== prevOy ||
      grid.cols !== lastCols || grid.rows !== lastRows

    if (cameraChanged) {
      forceFullRedraw = false
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, view.width, view.height)
      drawBackgroundViewport(ctx, curWorld, camera, grid.cols, grid.rows)
      drawOverlayFull(ctx, curWorld, camera, player, now, grid.cols, grid.rows)
    } else {
      const dirtySet = new Set()

      addDirtyCell(dirtySet, playerOldX, playerOldY, curWorld)
      addDirtyCell(dirtySet, player.x, player.y, curWorld)

      for (const snap of npcSnap) {
        const { e, ox, oy } = snap
        if (e.x !== ox || e.y !== oy) {
          addDirtyCell(dirtySet, ox, oy, curWorld)
          addDirtyCell(dirtySet, e.x, e.y, curWorld)
        }
      }

      // Animated objects (campfires)
      if (curWorld.spatialHash) {
        const visObj = curWorld.spatialHash.getInRect(
          camera.ox, camera.oy,
          camera.ox + grid.cols, camera.oy + grid.rows,
        )
        for (const e of visObj) {
          if (e.kind === 'object' && e.char === '*') {
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

    lastOx = camera.ox
    lastOy = camera.oy
    lastCols = grid.cols
    lastRows = grid.rows

    const target = dialogText ? null : findInteractTarget(curWorld, player.x, player.y)
    drawHud(ctx, view.width, view.height, player, curWorld.name, dialogText, !!target)

    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

boot()
