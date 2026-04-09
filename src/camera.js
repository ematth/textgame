/**
 * Viewport origin (top-left tile) so the player stays centered when possible.
 * When the world is smaller than the viewport, the world is centered on screen
 * (ox/oy go negative so OOB tiles render as void around the world).
 */
export function computeCameraOrigin(playerX, playerY, worldW, worldH, viewCols, viewRows) {
  let ox, oy

  if (worldW <= viewCols) {
    ox = -(((viewCols - worldW) / 2) | 0)
  } else {
    ox = (playerX - (viewCols / 2)) | 0
    if (ox < 0) ox = 0
    if (ox > worldW - viewCols) ox = worldW - viewCols
  }

  if (worldH <= viewRows) {
    oy = -(((viewRows - worldH) / 2) | 0)
  } else {
    oy = (playerY - (viewRows / 2)) | 0
    if (oy < 0) oy = 0
    if (oy > worldH - viewRows) oy = worldH - viewRows
  }

  return { ox, oy }
}
