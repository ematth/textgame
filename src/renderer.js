import { TILE_DEFS } from './tiles.js'
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const FONT_FAMILY = '"Courier New", monospace'
const FONT_SIZE = 16

let cellW = 10
let cellH = 18
let cellWMeasured = false
/** @type {ReturnType<typeof prepareWithSegments> | null} */
let preparedCellM = null

const worldStatic = document.createElement('canvas')
const worldStaticCtx = worldStatic.getContext('2d', { alpha: false })
if (!worldStaticCtx) throw new Error('offscreen 2d context')

let worldStaticValid = false
let worldStaticWorldW = -1
let worldStaticWorldH = -1
let worldStaticCellW = -1
let worldStaticCellH = -1

export function getCellSize() {
  return { cellW, cellH }
}

export function getFontString() {
  return `${FONT_SIZE}px ${FONT_FAMILY}`
}

export function measureCell() {
  if (!cellWMeasured) {
    preparedCellM ??= prepareWithSegments('M', getFontString())
    let maxW = 0
    walkLineRanges(preparedCellM, Number.POSITIVE_INFINITY, (line) => {
      if (line.width > maxW) maxW = line.width
    })
    cellW = Math.max(1, Math.ceil(maxW))
    cellH = Math.ceil(FONT_SIZE * 1.15)
    cellWMeasured = true
  }
  return { cellW, cellH }
}

export function resizeCanvas(canvas, existingCtx) {
  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  const ctx = existingCtx ?? canvas.getContext('2d', { alpha: false, desynchronized: true })
  if (!ctx) throw new Error('2d context')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  measureCell()
  worldStaticValid = false
  return { width: w, height: h, ctx }
}

export function getGridDimensions(canvasWidth, canvasHeight) {
  const cols = Math.max(1, Math.floor(canvasWidth / cellW))
  const rows = Math.max(1, Math.floor(canvasHeight / cellH))
  return { cols, rows }
}

function ensureWorldStatic(world) {
  if (
    worldStaticValid &&
    worldStaticWorldW === world.width &&
    worldStaticWorldH === world.height &&
    worldStaticCellW === cellW &&
    worldStaticCellH === cellH
  ) {
    return
  }

  worldStaticWorldW = world.width
  worldStaticWorldH = world.height
  worldStaticCellW = cellW
  worldStaticCellH = cellH
  worldStaticValid = true

  worldStatic.width = world.width * cellW
  worldStatic.height = world.height * cellH
  worldStaticCtx.font = getFontString()
  worldStaticCtx.textBaseline = 'top'

  const W = world.width
  const tiles = world.tiles

  for (let y = 0; y < world.height; y++) {
    const yPx = y * cellH

    let runFg = '#000000'
    let runBg = '#000000'
    let runStartX = 0
    let runLen = 0
    let runHasInk = false
    let runChars = []

    const flushRun = () => {
      if (runLen <= 0) return
      worldStaticCtx.fillStyle = runBg
      worldStaticCtx.fillRect(runStartX * cellW, yPx, runLen * cellW, cellH)
      if (runHasInk) {
        worldStaticCtx.fillStyle = runFg
        worldStaticCtx.fillText(runChars.join(''), runStartX * cellW, yPx)
      }
      runLen = 0
      runHasInk = false
      runChars = []
    }

    for (let x = 0; x < world.width; x++) {
      const td = TILE_DEFS[tiles[y * W + x]] ?? TILE_DEFS[0]
      const fg = td.fg
      const bg = td.bg
      const ch = td.char

      if (runLen === 0) {
        runFg = fg
        runBg = bg
        runStartX = x
        runLen = 1
        runHasInk = ch !== ' '
        runChars.push(ch)
      } else if (fg === runFg && bg === runBg) {
        runLen++
        runHasInk = runHasInk || ch !== ' '
        runChars.push(ch)
      } else {
        flushRun()
        runFg = fg
        runBg = bg
        runStartX = x
        runLen = 1
        runHasInk = ch !== ' '
        runChars.push(ch)
      }
    }

    flushRun()
  }
}

export function drawBackgroundViewport(ctx, world, camera, viewCols, viewRows) {
  ensureWorldStatic(world)
  const sx = camera.ox * cellW
  const sy = camera.oy * cellH
  const sw = viewCols * cellW
  const sh = viewRows * cellH
  ctx.drawImage(worldStatic, sx, sy, sw, sh, 0, 0, sw, sh)
}

function drawObjectCell(ctx, obj, td, vc, vr, time) {
  const xPx = vc * cellW
  const yPx = vr * cellH
  const fg = obj.char === '*' ? `hsl(${25 + Math.sin(time * 0.008) * 15}, 90%, ${55 + Math.sin(time * 0.012) * 10}%)` : obj.fg
  const bg = obj.bg ?? td.bg
  ctx.fillStyle = bg
  ctx.fillRect(xPx, yPx, cellW, cellH)
  ctx.fillStyle = fg
  ctx.fillText(obj.char, xPx, yPx)
}

export function drawOverlayFull(ctx, world, camera, entities, player, time, viewCols, viewRows) {
  ctx.font = getFontString()
  ctx.textBaseline = 'top'

  const { ox, oy } = camera
  const playerFg = '#f8fafc'

  for (const e of entities.list) {
    const vc = e.x - ox
    const vr = e.y - oy
    if (vc < 0 || vc >= viewCols || vr < 0 || vr >= viewRows) continue

    const td = TILE_DEFS[world.tiles[e.y * world.width + e.x]] ?? TILE_DEFS[0]

    if (e.kind === 'npc') {
      ctx.fillStyle = e.fg
      ctx.fillText(e.char, vc * cellW, vr * cellH)
    } else {
      drawObjectCell(ctx, e, td, vc, vr, time)
    }
  }

  const pvc = player.x - ox
  const pvr = player.y - oy
  if (pvc >= 0 && pvc < viewCols && pvr >= 0 && pvr < viewRows) {
    ctx.fillStyle = playerFg
    ctx.fillText('@', pvc * cellW, pvr * cellH)
  }
}

function findEntityAt(entities, wx, wy) {
  /** @type {any} */
  let npc = null
  /** @type {any} */
  let obj = null
  for (const e of entities.list) {
    if (e.x !== wx || e.y !== wy) continue
    if (e.kind === 'npc') npc = e
    else obj = e
  }
  return { npc, obj }
}

export function drawOverlayDirty(ctx, world, camera, entities, player, time, dirtyWorldCells, viewCols, viewRows) {
  ctx.font = getFontString()
  ctx.textBaseline = 'top'

  const { ox, oy } = camera
  const playerFg = '#f8fafc'
  ensureWorldStatic(world)

  for (let i = 0; i < dirtyWorldCells.length; i++) {
    const { wx, wy } = dirtyWorldCells[i]
    const vc = wx - ox
    const vr = wy - oy
    if (vc < 0 || vc >= viewCols || vr < 0 || vr >= viewRows) continue

    const sx = wx * cellW
    const sy = wy * cellH
    ctx.drawImage(worldStatic, sx, sy, cellW, cellH, vc * cellW, vr * cellH, cellW, cellH)

    const { npc, obj } = findEntityAt(entities, wx, wy)

    if (obj) {
      const td = TILE_DEFS[world.tiles[wy * world.width + wx]] ?? TILE_DEFS[0]
      drawObjectCell(ctx, obj, td, vc, vr, time)
    }
    if (npc) {
      ctx.fillStyle = npc.fg
      ctx.fillText(npc.char, vc * cellW, vr * cellH)
    }
    if (player.x === wx && player.y === wy) {
      ctx.fillStyle = playerFg
      ctx.fillText('@', vc * cellW, vr * cellH)
    }
  }
}
