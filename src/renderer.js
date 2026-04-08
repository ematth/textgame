import { TILE_DEFS } from './tiles.js'
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const FONT_FAMILY = '"Courier New", monospace'
const FONT_SIZE = 16
const MIN_ZOOM = 1
const MAX_ZOOM = 5

let baseCellW = 10
let baseCellH = 18
let cellW = 10
let cellH = 18
let cellWMeasured = false
let zoomLevel = 1
/** @type {ReturnType<typeof prepareWithSegments> | null} */
let preparedCellM = null

export function getCellSize() {
  return { cellW, cellH }
}

export function getZoom() {
  return zoomLevel
}

export function setZoom(level) {
  const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(level)))
  if (clamped === zoomLevel) return false
  zoomLevel = clamped
  cellW = baseCellW * zoomLevel
  cellH = baseCellH * zoomLevel
  return true
}

export function getFontString() {
  return `${FONT_SIZE * zoomLevel}px ${FONT_FAMILY}`
}

function getBaseFontString() {
  return `${FONT_SIZE}px ${FONT_FAMILY}`
}

export function measureCell() {
  if (!cellWMeasured) {
    preparedCellM ??= prepareWithSegments('M', getBaseFontString())
    let maxW = 0
    walkLineRanges(preparedCellM, Number.POSITIVE_INFINITY, (line) => {
      if (line.width > maxW) maxW = line.width
    })
    baseCellW = Math.max(1, Math.ceil(maxW))
    baseCellH = Math.ceil(FONT_SIZE * 1.15)
    cellWMeasured = true
  }
  cellW = baseCellW * zoomLevel
  cellH = baseCellH * zoomLevel
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
  return { width: w, height: h, ctx }
}

export function getGridDimensions(canvasWidth, canvasHeight) {
  const cols = Math.max(1, Math.ceil(canvasWidth / cellW))
  const rows = Math.max(1, Math.ceil(canvasHeight / cellH))
  return { cols, rows }
}

const VOID_TILE = { char: '▲', fg: '#8a8a8a', bg: '#2a2a2a' }

export function drawBackgroundViewport(ctx, world, camera, viewCols, viewRows) {
  ctx.font = getFontString()
  ctx.textBaseline = 'top'

  const { ox, oy } = camera
  const W = world.width
  const H = world.height
  const tiles = world.tiles

  for (let vr = 0; vr < viewRows; vr++) {
    const wy = oy + vr
    const yPx = vr * cellH

    let runFg = '#000000'
    let runBg = '#000000'
    let runStartVC = 0
    let runLen = 0
    let runHasInk = false
    let runChars = []

    const flushRun = () => {
      if (runLen <= 0) return
      ctx.fillStyle = runBg
      ctx.fillRect(runStartVC * cellW, yPx, runLen * cellW, cellH)
      if (runHasInk) {
        ctx.fillStyle = runFg
        ctx.fillText(runChars.join(''), runStartVC * cellW, yPx)
      }
      runLen = 0
      runHasInk = false
      runChars = []
    }

    for (let vc = 0; vc < viewCols; vc++) {
      const wx = ox + vc
      const oob = wx < 0 || wx >= W || wy < 0 || wy >= H
      const td = oob ? VOID_TILE : (TILE_DEFS[tiles[wy * W + wx]] ?? TILE_DEFS[0])
      const fg = td.fg
      const bg = td.bg
      const ch = td.char

      if (runLen === 0) {
        runFg = fg
        runBg = bg
        runStartVC = vc
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
        runStartVC = vc
        runLen = 1
        runHasInk = ch !== ' '
        runChars.push(ch)
      }
    }

    flushRun()
  }
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

function drawTileCell(ctx, world, wx, wy, vc, vr) {
  const td = TILE_DEFS[world.tiles[wy * world.width + wx]] ?? TILE_DEFS[0]
  const xPx = vc * cellW
  const yPx = vr * cellH
  ctx.fillStyle = td.bg
  ctx.fillRect(xPx, yPx, cellW, cellH)
  if (td.char !== ' ') {
    ctx.fillStyle = td.fg
    ctx.fillText(td.char, xPx, yPx)
  }
}

export function drawOverlayDirty(ctx, world, camera, entities, player, time, dirtyWorldCells, viewCols, viewRows) {
  ctx.font = getFontString()
  ctx.textBaseline = 'top'

  const { ox, oy } = camera
  const playerFg = '#f8fafc'

  for (let i = 0; i < dirtyWorldCells.length; i++) {
    const { wx, wy } = dirtyWorldCells[i]
    const vc = wx - ox
    const vr = wy - oy
    if (vc < 0 || vc >= viewCols || vr < 0 || vr >= viewRows) continue

    drawTileCell(ctx, world, wx, wy, vc, vr)

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
