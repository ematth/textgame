import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const HUD_FONT = '14px "Courier New", monospace'
const LINE_H = 18

let lastDialogText = ''
/** @type {ReturnType<typeof prepareWithSegments> | null} */
let lastPrepared = null
let lastInnerW = 0
let lastLines = null

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {{ x: number, y: number }} player
 * @param {string} worldName
 * @param {string | null} dialogText
 * @param {boolean} showInteractPrompt
 */
export function drawHud(ctx, canvasW, canvasH, player, worldName, dialogText, showInteractPrompt) {
  ctx.font = HUD_FONT
  ctx.textBaseline = 'top'

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvasW, 32)
  ctx.fillStyle = '#e2e8f0'
  ctx.fillText(`${worldName}    (${player.x}, ${player.y})`, 10, 9)

  if (showInteractPrompt && !dialogText) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    const tw = 200
    ctx.fillRect(canvasW - tw - 10, 6, tw, 22)
    ctx.fillStyle = '#86efac'
    ctx.fillText('[Space] Interact', canvasW - tw - 2, 10)
  }

  if (!dialogText) {
    lastDialogText = ''
    lastPrepared = null
    return
  }

  if (dialogText !== lastDialogText) {
    lastDialogText = dialogText
    lastPrepared = prepareWithSegments(dialogText, HUD_FONT)
    lastInnerW = 0
    lastLines = null
  }

  if (!lastPrepared) return

  const pad = 16
  const boxH = 132
  const boxY = canvasH - boxH - pad
  const boxW = canvasW - pad * 2

  const innerW = boxW - 28
  if (lastLines === null || innerW !== lastInnerW) {
    lastInnerW = innerW
    const { lines } = layoutWithLines(lastPrepared, innerW, LINE_H)
    lastLines = lines
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
  ctx.fillRect(pad, boxY, boxW, boxH)
  ctx.strokeStyle = '#475569'
  ctx.strokeRect(pad + 0.5, boxY + 0.5, boxW - 1, boxH - 1)

  ctx.fillStyle = '#f1f5f9'
  ctx.font = HUD_FONT
  let ty = boxY + 14
  const textX = pad + 14
  for (const line of lastLines ?? []) {
    ctx.fillText(line.text, textX, ty)
    ty += LINE_H
  }

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px "Courier New", monospace'
  ctx.fillText('[Space] Dismiss', textX, boxY + boxH - 26)
}
