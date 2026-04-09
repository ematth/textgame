const BG_COLOR = '#0a0a0a'
const BAR_BG = '#1e293b'
const BAR_FG = '#3b82f6'
const TEXT_COLOR = '#e2e8f0'
const SUBTITLE_COLOR = '#94a3b8'
const TITLE_FONT = 'bold 28px "Courier New", monospace'
const PHASE_FONT = '16px "Courier New", monospace'
const SUBTITLE_FONT = '13px "Courier New", monospace'

/**
 * Draw a loading screen on the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - canvas CSS width
 * @param {number} h - canvas CSS height
 * @param {string} phase - current loading phase text
 * @param {number} progress - 0..1
 */
export function drawLoadingScreen(ctx, w, h, phase, progress) {
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  // Title
  ctx.font = TITLE_FONT
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = TEXT_COLOR
  ctx.fillText('City of Stonehaven', cx, cy - 60)

  // Subtitle
  ctx.font = SUBTITLE_FONT
  ctx.fillStyle = SUBTITLE_COLOR
  ctx.fillText('Preparing the kingdom...', cx, cy - 30)

  // Progress bar
  const barW = Math.min(400, w - 80)
  const barH = 18
  const barX = cx - barW / 2
  const barY = cy

  ctx.fillStyle = BAR_BG
  ctx.fillRect(barX, barY, barW, barH)

  const fillW = Math.max(0, Math.min(barW, barW * progress))
  ctx.fillStyle = BAR_FG
  ctx.fillRect(barX, barY, fillW, barH)

  // Bar border
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1
  ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1)

  // Phase text
  ctx.font = PHASE_FONT
  ctx.fillStyle = SUBTITLE_COLOR
  ctx.fillText(phase, cx, barY + barH + 24)

  // Percentage
  ctx.fillStyle = TEXT_COLOR
  ctx.fillText(`${(progress * 100) | 0}%`, cx, barY + barH + 48)

  ctx.textAlign = 'left'
}

/**
 * Returns a promise that resolves on the next animation frame.
 */
export function yieldFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}
