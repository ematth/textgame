import { TILE_DEFS } from './tiles.js'
import {
  isBuildingMode, getSelectedTile, setSelectedTile,
  getGalleryScroll, scrollGallery, TILE_CATEGORIES,
} from './building.js'

const PANEL_W = 220
const PANEL_TOP = 34
const ENTRY_H = 32
const CATEGORY_H = 26
const PAD = 8
const TILE_PREVIEW_SIZE = 20

/**
 * Compute total content height for the gallery
 */
function computeContentHeight() {
  let h = PAD
  for (const cat of TILE_CATEGORIES) {
    h += CATEGORY_H
    h += cat.tiles.length * ENTRY_H
    h += PAD
  }
  return h
}

/**
 * Draw the building gallery panel. Returns info about interaction state.
 * @returns {{ clickedInGallery: boolean, hoveredInGallery: boolean }}
 */
export function drawBuildingGallery(ctx, canvasW, canvasH, mouseX, mouseY, click, rightClick, scrollDelta) {
  if (!isBuildingMode()) return { clickedInGallery: false, hoveredInGallery: false }

  const panelH = canvasH - PANEL_TOP
  const contentH = computeContentHeight()
  const maxScroll = Math.max(0, contentH - panelH + PAD)

  // Handle scroll if mouse is over panel
  const mouseInPanel = mouseX >= 0 && mouseX < PANEL_W && mouseY >= PANEL_TOP
  if (mouseInPanel && scrollDelta !== 0) {
    scrollGallery(scrollDelta, maxScroll)
  }

  const scroll = getGalleryScroll()
  const selected = getSelectedTile()

  // Draw panel background
  ctx.fillStyle = 'rgba(12, 18, 30, 0.94)'
  ctx.fillRect(0, PANEL_TOP, PANEL_W, panelH)

  // Right border
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PANEL_W + 0.5, PANEL_TOP)
  ctx.lineTo(PANEL_W + 0.5, canvasH)
  ctx.stroke()

  // Clip to panel area
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, PANEL_TOP, PANEL_W, panelH)
  ctx.clip()

  let y = PANEL_TOP + PAD - scroll
  let clickedInGallery = false
  let hoveredIdx = -1

  for (const cat of TILE_CATEGORIES) {
    // Category header
    if (y + CATEGORY_H > PANEL_TOP && y < canvasH) {
      ctx.fillStyle = '#64748b'
      ctx.font = '11px "Courier New", monospace'
      ctx.textBaseline = 'top'
      ctx.fillText(cat.name.toUpperCase(), PAD, y + 6)
      // Underline
      const tw = ctx.measureText(cat.name.toUpperCase()).width
      ctx.strokeStyle = '#334155'
      ctx.beginPath()
      ctx.moveTo(PAD, y + CATEGORY_H - 2)
      ctx.lineTo(PANEL_W - PAD, y + CATEGORY_H - 2)
      ctx.stroke()
    }
    y += CATEGORY_H

    for (const tileId of cat.tiles) {
      const entryTop = y
      const entryBot = y + ENTRY_H

      if (entryBot > PANEL_TOP && entryTop < canvasH) {
        const td = TILE_DEFS[tileId]
        if (!td) { y += ENTRY_H; continue }

        const isHovered = mouseInPanel && mouseY >= entryTop && mouseY < entryBot && entryTop >= PANEL_TOP
        const isSelected = tileId === selected

        // Hover highlight
        if (isHovered) {
          ctx.fillStyle = 'rgba(71, 85, 105, 0.4)'
          ctx.fillRect(0, entryTop, PANEL_W, ENTRY_H)
          hoveredIdx = tileId
        }

        // Selection highlight
        if (isSelected) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'
          ctx.fillRect(0, entryTop, PANEL_W, ENTRY_H)
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 1
          ctx.strokeRect(1, entryTop + 0.5, PANEL_W - 2, ENTRY_H - 1)
        }

        // Tile preview box
        const previewX = PAD + 2
        const previewY = entryTop + (ENTRY_H - TILE_PREVIEW_SIZE) / 2
        ctx.fillStyle = td.bg
        ctx.fillRect(previewX, previewY, TILE_PREVIEW_SIZE, TILE_PREVIEW_SIZE)
        ctx.strokeStyle = '#475569'
        ctx.strokeRect(previewX + 0.5, previewY + 0.5, TILE_PREVIEW_SIZE - 1, TILE_PREVIEW_SIZE - 1)

        // Tile character
        ctx.fillStyle = td.fg
        ctx.font = '14px "Courier New", monospace'
        ctx.textBaseline = 'middle'
        ctx.fillText(td.char, previewX + 4, previewY + TILE_PREVIEW_SIZE / 2)

        // Tile name
        ctx.fillStyle = isSelected ? '#e2e8f0' : '#94a3b8'
        ctx.font = '12px "Courier New", monospace'
        ctx.textBaseline = 'middle'
        const name = td.name || `Tile ${tileId}`
        ctx.fillText(name, previewX + TILE_PREVIEW_SIZE + 8, entryTop + ENTRY_H / 2)

        // Handle click on this entry
        if (click && mouseInPanel && mouseY >= entryTop && mouseY < entryBot && entryTop >= PANEL_TOP) {
          setSelectedTile(isSelected ? -1 : tileId)
          clickedInGallery = true
        }
      }

      y += ENTRY_H
    }

    y += PAD
  }

  ctx.restore()

  // Scroll indicator
  if (contentH > panelH) {
    const scrollbarH = Math.max(20, (panelH / contentH) * panelH)
    const scrollbarY = PANEL_TOP + (scroll / maxScroll) * (panelH - scrollbarH)
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)'
    ctx.fillRect(PANEL_W - 4, scrollbarY, 3, scrollbarH)
  }

  return { clickedInGallery, hoveredInGallery: mouseInPanel }
}

/**
 * Draw building mode indicator in HUD area
 */
export function drawBuildingModeIndicator(ctx, canvasW) {
  if (!isBuildingMode()) return

  ctx.font = '12px "Courier New", monospace'
  ctx.textBaseline = 'top'
  const text = 'BUILDING MODE [B]'
  const tw = ctx.measureText(text).width
  const x = (canvasW - tw) / 2
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
  ctx.fillRect(x - 8, 6, tw + 16, 20)
  ctx.strokeStyle = '#38bdf8'
  ctx.strokeRect(x - 8 + 0.5, 6.5, tw + 15, 19)
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(text, x, 10)
}

/**
 * Draw cursor tile preview at mouse position when building
 */
export function drawCursorPreview(ctx, cellW, cellH, hvc, hvr, viewCols, viewRows) {
  if (!isBuildingMode()) return
  const selected = getSelectedTile()
  if (selected < 0) return
  if (hvc < 0 || hvc >= viewCols || hvr < 0 || hvr >= viewRows) return

  const td = TILE_DEFS[selected]
  if (!td) return

  const xPx = hvc * cellW
  const yPx = hvr * cellH

  ctx.globalAlpha = 0.5
  ctx.fillStyle = td.bg
  ctx.fillRect(xPx, yPx, cellW, cellH)
  if (td.char !== ' ') {
    ctx.fillStyle = td.fg
    ctx.font = `${Math.round(cellH * 0.87)}px "Courier New", monospace`
    ctx.textBaseline = 'top'
    ctx.fillText(td.char, xPx, yPx)
  }
  ctx.globalAlpha = 1.0

  // Highlight border
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)'
  ctx.lineWidth = 2
  ctx.strokeRect(xPx + 1, yPx + 1, cellW - 2, cellH - 2)
}

export const GALLERY_PANEL_WIDTH = PANEL_W
