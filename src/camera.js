/**
 * Viewport origin (top-left tile) so the player stays centered when possible.
 * @param {number} playerX
 * @param {number} playerY
 * @param {number} worldW
 * @param {number} worldH
 * @param {number} viewCols
 * @param {number} viewRows
 * @param {number} [lerp] 0..1 optional smoothing (not used; snap for crisp grid)
 */
export function computeCameraOrigin(playerX, playerY, worldW, worldH, viewCols, viewRows) {
  let ox = playerX - (viewCols / 2) | 0
  let oy = playerY - (viewRows / 2) | 0

  const maxOx = Math.max(0, worldW - viewCols)
  const maxOy = Math.max(0, worldH - viewRows)
  if (ox < 0) ox = 0
  if (oy < 0) oy = 0
  if (ox > maxOx) ox = maxOx
  if (oy > maxOy) oy = maxOy

  return { ox, oy }
}
