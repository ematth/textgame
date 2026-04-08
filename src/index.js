import { initInput, getDirection, consumeSpacePress, isSpaceDown } from './input.js'
import { generateWorld } from './world.js'
import { createPlayer, tryMovePlayer } from './player.js'
import { computeCameraOrigin } from './camera.js'
import { createEntities, updateEntities, entityBlocksTile, findInteractTarget } from './entities.js'
import {
  resizeCanvas,
  getGridDimensions,
  drawBackgroundViewport,
  drawOverlayFull,
  drawOverlayDirty,
} from './renderer.js'
import { drawHud } from './hud.js'

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game'))
if (!canvas) throw new Error('#game canvas missing')

let ctx = /** @type {CanvasRenderingContext2D} */ (
  canvas.getContext('2d', { alpha: false, desynchronized: true })
)
if (!ctx) throw new Error('2d context')

const world = generateWorld()
const cx = (world.width / 2) | 0
const cy = (world.height / 2) | 0
const player = createPlayer(cx, cy)
const entities = createEntities(world)

initInput()

let view = resizeCanvas(canvas, ctx)
let grid = getGridDimensions(view.width, view.height)
let camera = computeCameraOrigin(player.x, player.y, world.width, world.height, grid.cols, grid.rows)

/** @type {string | null} */
let dialogText = null
let dialogOpenedAt = 0

window.addEventListener('resize', () => {
  view = resizeCanvas(canvas, ctx)
  grid = getGridDimensions(view.width, view.height)
  camera = computeCameraOrigin(player.x, player.y, world.width, world.height, grid.cols, grid.rows)
})

let lastTs = performance.now()
let lastOx = camera.ox
let lastOy = camera.oy
let lastCols = grid.cols
let lastRows = grid.rows

const npcList = entities.list.filter((e) => e.kind === 'npc')
const fireList = entities.list.filter((e) => e.kind === 'object' && e.char === '*')
const npcPrev = npcList.map(() => ({ x: 0, y: 0 }))

function addDirtyCell(dirtySet, wx, wy) {
  if (wx < 0 || wx >= world.width || wy < 0 || wy >= world.height) return
  dirtySet.add(wy * world.width + wx)
}

function frame(now) {
  const dt = Math.min(50, now - lastTs)
  lastTs = now

  const prevOx = camera.ox
  const prevOy = camera.oy

  const playerOldX = player.x
  const playerOldY = player.y

  for (let i = 0; i < npcList.length; i++) {
    npcPrev[i].x = npcList[i].x
    npcPrev[i].y = npcList[i].y
  }

  if (dialogText) {
    // If the player holds Space, the keydown was already consumed by opening the dialog.
    // Allow dismissal on held Space after a small debounce to prevent instant close.
    if ((consumeSpacePress() || isSpaceDown()) && now - dialogOpenedAt > 150) {
      dialogText = null
    }
  } else {
    const dir = getDirection()
    tryMovePlayer(
      player,
      dir,
      world,
      (x, y) => entityBlocksTile(entities, x, y),
      now,
    )

    if (consumeSpacePress()) {
      const target = findInteractTarget(entities, player.x, player.y)
      if (target) {
        dialogText = target.kind === 'npc' ? `${target.name}:\n${target.dialog}` : `${target.label}:\n${target.dialog}`
        dialogOpenedAt = now
      }
    }
  }

  updateEntities(entities, world, player.x, player.y, dt, now)

  camera = computeCameraOrigin(player.x, player.y, world.width, world.height, grid.cols, grid.rows)

  const cameraChanged = camera.ox !== prevOx || camera.oy !== prevOy || grid.cols !== lastCols || grid.rows !== lastRows

  if (cameraChanged) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, view.width, view.height)
    drawBackgroundViewport(ctx, world, camera, grid.cols, grid.rows)
    drawOverlayFull(ctx, world, camera, entities, player, now, grid.cols, grid.rows)
  } else {
    const dirtySet = new Set()

    addDirtyCell(dirtySet, playerOldX, playerOldY)
    addDirtyCell(dirtySet, player.x, player.y)

    for (let i = 0; i < npcList.length; i++) {
      const npc = npcList[i]
      const px = npcPrev[i].x
      const py = npcPrev[i].y
      if (npc.x !== px || npc.y !== py) {
        addDirtyCell(dirtySet, px, py)
        addDirtyCell(dirtySet, npc.x, npc.y)
      }
    }

    // Animated object(s) (campfire) need continuous redraw.
    for (const fire of fireList) addDirtyCell(dirtySet, fire.x, fire.y)

    /** @type {{wx:number, wy:number}[]} */
    const dirtyCells = []
    for (const key of dirtySet) {
      const wy = (key / world.width) | 0
      const wx = key - wy * world.width
      dirtyCells.push({ wx, wy })
    }

    drawOverlayDirty(ctx, world, camera, entities, player, now, dirtyCells, grid.cols, grid.rows)
  }

  lastOx = camera.ox
  lastOy = camera.oy
  lastCols = grid.cols
  lastRows = grid.rows

  const target = dialogText ? null : findInteractTarget(entities, player.x, player.y)
  drawHud(ctx, view.width, view.height, player, dialogText, !!target)

  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
