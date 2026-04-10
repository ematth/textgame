import { getWorldTile, getBiome } from './biomes.js'
import { getStructuresForChunk, stampStructure } from './structures.js'

export const CHUNK_BITS = 7
export const CHUNK_SIZE = 1 << CHUNK_BITS // 128
export const CHUNK_MASK = CHUNK_SIZE - 1
const MAX_CACHE = 2000

export function createChunkCache(worldSeed) {
  const cache = new Map()
  const accessOrder = []

  function key(cx, cy) {
    return (cx << 16) ^ cy
  }

  function evict() {
    while (cache.size > MAX_CACHE && accessOrder.length > 0) {
      const oldKey = accessOrder.shift()
      cache.delete(oldKey)
    }
  }

  function getOrGenerate(cx, cy) {
    const k = key(cx, cy)
    let chunk = cache.get(k)
    if (chunk) return chunk

    chunk = generateChunk(cx, cy, worldSeed)
    cache.set(k, chunk)
    accessOrder.push(k)
    evict()
    return chunk
  }

  function getIfLoaded(cx, cy) {
    return cache.get(key(cx, cy)) ?? null
  }

  return { getOrGenerate, getIfLoaded, cache }
}

function generateChunk(cx, cy, worldSeed) {
  const tiles = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE)
  const baseX = cx * CHUNK_SIZE
  const baseY = cy * CHUNK_SIZE

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      tiles[ly * CHUNK_SIZE + lx] = getWorldTile(baseX + lx, baseY + ly)
    }
  }

  const biome = getBiome(baseX + (CHUNK_SIZE >> 1), baseY + (CHUNK_SIZE >> 1))

  const chunk = { cx, cy, tiles, biome, entities: [], portals: [] }

  const structures = getStructuresForChunk(cx, cy, worldSeed)
  for (const s of structures) {
    stampStructure(chunk, s, worldSeed)
  }

  return chunk
}

export function chunkGetTile(chunkCache, x, y, worldW, worldH) {
  if (x < 0 || x >= worldW || y < 0 || y >= worldH) return 4 // MOUNTAIN as OOB
  const cx = x >> CHUNK_BITS
  const cy = y >> CHUNK_BITS
  const chunk = chunkCache.getOrGenerate(cx, cy)
  return chunk.tiles[(y & CHUNK_MASK) * CHUNK_SIZE + (x & CHUNK_MASK)]
}

export function ensureChunksLoaded(chunkCache, centerX, centerY, radiusTiles) {
  const r = Math.ceil(radiusTiles / CHUNK_SIZE) + 1
  const ccx = centerX >> CHUNK_BITS
  const ccy = centerY >> CHUNK_BITS
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      chunkCache.getOrGenerate(ccx + dx, ccy + dy)
    }
  }
}

export function getLoadedChunksInRect(chunkCache, x0, y0, x1, y1) {
  const cx0 = x0 >> CHUNK_BITS
  const cy0 = y0 >> CHUNK_BITS
  const cx1 = x1 >> CHUNK_BITS
  const cy1 = y1 >> CHUNK_BITS
  const chunks = []
  for (let cy = cy0; cy <= cy1; cy++) {
    for (let cx = cx0; cx <= cx1; cx++) {
      const c = chunkCache.getIfLoaded(cx, cy)
      if (c) chunks.push(c)
    }
  }
  return chunks
}
