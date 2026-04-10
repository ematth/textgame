import { getBiomeColor, BIOME_NAMES, getBiome, BIOME } from './biomes.js'
import { getPOIsInRect, POI_TYPE } from './structures.js'

const MAP_TILE_SIZE = 100 // 1 map pixel = 100 world tiles
const PAN_SPEED = 20
const MIN_SCALE = 0.5
const MAX_SCALE = 4

export function createWorldMap(worldW, worldH, seed) {
  return {
    worldW,
    worldH,
    seed,
    camX: worldW / 2,
    camY: worldH / 2,
    scale: 1,
    textureCanvas: null,
    textureScale: -1,
    textureCamX: -1,
    textureCamY: -1,
  }
}

export function updateWorldMapCamera(map, dir, zoomDelta, viewW, viewH) {
  const panAmount = PAN_SPEED / map.scale * MAP_TILE_SIZE
  if (dir) {
    map.camX += dir.dx * panAmount
    map.camY += dir.dy * panAmount
  }
  if (zoomDelta !== 0) {
    map.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, map.scale + zoomDelta * 0.25))
  }
  map.camX = Math.max(0, Math.min(map.worldW, map.camX))
  map.camY = Math.max(0, Math.min(map.worldH, map.camY))
}

export function drawWorldMap(ctx, map, viewW, viewH, playerX, playerY, worldSeed) {
  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(0, 0, viewW, viewH)

  const pixelSize = map.scale
  const mapPixelsW = Math.ceil(viewW / pixelSize)
  const mapPixelsH = Math.ceil(viewH / pixelSize)

  const worldTilesW = mapPixelsW * MAP_TILE_SIZE
  const worldTilesH = mapPixelsH * MAP_TILE_SIZE

  const worldX0 = map.camX - worldTilesW / 2
  const worldY0 = map.camY - worldTilesH / 2

  // Render biome texture
  renderBiomeTexture(ctx, map, viewW, viewH, worldX0, worldY0, mapPixelsW, mapPixelsH, pixelSize)

  // Draw POI markers
  drawPOIMarkers(ctx, map, viewW, viewH, worldX0, worldY0, pixelSize, worldSeed)

  // Draw player marker
  const px = ((playerX - worldX0) / MAP_TILE_SIZE) * pixelSize
  const py = ((playerY - worldY0) / MAP_TILE_SIZE) * pixelSize
  if (px >= 0 && px < viewW && py >= 0 && py < viewH) {
    const blink = Math.sin(Date.now() * 0.005) > 0
    ctx.fillStyle = blink ? '#ffffff' : '#ffcc00'
    const markerSize = Math.max(4, 3 * pixelSize)
    ctx.fillRect(px - markerSize / 2, py - markerSize / 2, markerSize, markerSize)
    // Arrow-shaped indicator
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.max(12, 10 * pixelSize)}px "Courier New", monospace`
    ctx.textBaseline = 'bottom'
    ctx.fillText('@', px - 4 * pixelSize, py - markerSize / 2)
  }

  // HUD overlay
  ctx.fillStyle = 'rgba(10, 10, 18, 0.85)'
  ctx.fillRect(0, 0, viewW, 36)
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '14px "Courier New", monospace'
  ctx.textBaseline = 'top'
  ctx.fillText(`World Map  |  [M] Close  |  WASD: Pan  |  +/-: Zoom (${map.scale.toFixed(1)}x)  |  Player: (${playerX}, ${playerY})`, 10, 10)

  // Legend at bottom
  ctx.fillStyle = 'rgba(10, 10, 18, 0.85)'
  ctx.fillRect(0, viewH - 28, viewW, 28)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px "Courier New", monospace'
  const biome = getBiome(map.camX, map.camY)
  ctx.fillText(`Center: (${map.camX | 0}, ${map.camY | 0})  Biome: ${BIOME_NAMES[biome] || 'Unknown'}`, 10, viewH - 20)
}

function renderBiomeTexture(ctx, map, viewW, viewH, worldX0, worldY0, mapPixelsW, mapPixelsH, pixelSize) {
  // Use imageData for fast pixel-level rendering
  const iw = Math.min(mapPixelsW, Math.ceil(viewW / pixelSize))
  const ih = Math.min(mapPixelsH, Math.ceil(viewH / pixelSize))
  if (iw <= 0 || ih <= 0) return

  // Limit canvas size to avoid allocation failures
  const maxDim = 2000
  const tw = Math.min(iw, maxDim)
  const th = Math.min(ih, maxDim)

  if (!map.textureCanvas || map.textureCanvas.width !== tw || map.textureCanvas.height !== th) {
    map.textureCanvas = document.createElement('canvas')
    map.textureCanvas.width = tw
    map.textureCanvas.height = th
    map.textureCamX = -1
  }

  // Only re-render if camera moved enough
  const camDist = Math.abs(map.camX - map.textureCamX) + Math.abs(map.camY - map.textureCamY)
  if (camDist < MAP_TILE_SIZE * 0.5 && map.textureScale === map.scale) {
    ctx.drawImage(map.textureCanvas, 0, 0, viewW, viewH)
    return
  }

  const tctx = map.textureCanvas.getContext('2d')
  const imageData = tctx.createImageData(tw, th)
  const data = imageData.data

  const stepX = (mapPixelsW / tw) * MAP_TILE_SIZE
  const stepY = (mapPixelsH / th) * MAP_TILE_SIZE

  for (let py = 0; py < th; py++) {
    const wy = worldY0 + py * stepY
    for (let px = 0; px < tw; px++) {
      const wx = worldX0 + px * stepX
      const oob = wx < 0 || wx >= map.worldW || wy < 0 || wy >= map.worldH
      const idx = (py * tw + px) * 4
      if (oob) {
        data[idx] = 5; data[idx + 1] = 5; data[idx + 2] = 10; data[idx + 3] = 255
      } else {
        const color = getBiomeColor(wx, wy)
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255
      }
    }
  }

  tctx.putImageData(imageData, 0, 0)
  map.textureCamX = map.camX
  map.textureCamY = map.camY
  map.textureScale = map.scale

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(map.textureCanvas, 0, 0, viewW, viewH)
  ctx.imageSmoothingEnabled = true
}

const POI_COLORS = {
  [POI_TYPE.VILLAGE]: '#88cc44',
  [POI_TYPE.TOWN]: '#ccaa44',
  [POI_TYPE.CITY]: '#ffdd55',
  [POI_TYPE.CASTLE]: '#cc8844',
  [POI_TYPE.CAVE]: '#8888aa',
  [POI_TYPE.DUNGEON]: '#aa4444',
}

const POI_CHARS = {
  [POI_TYPE.VILLAGE]: '·',
  [POI_TYPE.TOWN]: '□',
  [POI_TYPE.CITY]: '■',
  [POI_TYPE.CASTLE]: '♦',
  [POI_TYPE.CAVE]: 'O',
  [POI_TYPE.DUNGEON]: '>',
}

function drawPOIMarkers(ctx, map, viewW, viewH, worldX0, worldY0, pixelSize, worldSeed) {
  const worldTilesW = (viewW / pixelSize) * MAP_TILE_SIZE
  const worldTilesH = (viewH / pixelSize) * MAP_TILE_SIZE

  const pois = getPOIsInRect(
    worldX0, worldY0,
    worldX0 + worldTilesW, worldY0 + worldTilesH,
    worldSeed
  )

  const fontSize = Math.max(10, 8 * pixelSize)
  ctx.font = `${fontSize}px "Courier New", monospace`
  ctx.textBaseline = 'middle'

  for (const poi of pois) {
    const sx = ((poi.x + poi.w / 2 - worldX0) / MAP_TILE_SIZE) * pixelSize
    const sy = ((poi.y + poi.h / 2 - worldY0) / MAP_TILE_SIZE) * pixelSize
    if (sx < -20 || sx > viewW + 20 || sy < -20 || sy > viewH + 20) continue

    ctx.fillStyle = POI_COLORS[poi.type] || '#ffffff'
    ctx.fillText(POI_CHARS[poi.type] || '?', sx, sy)

    if (pixelSize >= 1.5 && poi.name) {
      ctx.font = `${Math.max(9, 6 * pixelSize)}px "Courier New", monospace`
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillText(poi.name, sx + fontSize * 0.8, sy)
      ctx.font = `${fontSize}px "Courier New", monospace`
    }
  }
}
