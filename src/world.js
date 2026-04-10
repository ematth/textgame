import { TILE, getTileDef } from './tiles.js'
import { setSeed } from './noise.js'
import { createChunkCache, chunkGetTile, ensureChunksLoaded, CHUNK_BITS, CHUNK_SIZE, CHUNK_MASK } from './chunks.js'

export const WORLD_W = 50000
export const WORLD_H = 50000
export const WORLD_SEED = 42

// District IDs - kept for interior/NPC compatibility
export const DISTRICT = {
  MARKET: 0,
  RESIDENTIAL: 1,
  NOBLE: 2,
  SLUMS: 3,
  TEMPLE: 4,
  MILITARY: 5,
  WILDERNESS: 6,
}

export const DISTRICT_NAMES = [
  'Market District',
  'Residential Quarter',
  'Noble Quarter',
  'The Slums',
  'Temple District',
  'Military Ward',
  'Wilderness',
]

export function generateWorld() {
  setSeed(WORLD_SEED)

  const chunkCache = createChunkCache(WORLD_SEED)

  // Pre-load chunks around spawn (center of world)
  const spawnX = (WORLD_W / 2) | 0
  const spawnY = (WORLD_H / 2) | 0
  ensureChunksLoaded(chunkCache, spawnX, spawnY, 256)

  const world = {
    id: 'overworld',
    name: 'The Realm',
    width: WORLD_W,
    height: WORLD_H,
    seed: WORLD_SEED,
    tiles: null, // no flat array - uses chunks
    chunkCache,
    tileOverrides: new Map(),
    portals: [],
    entities: { list: [] },
    spatialHash: null,
    isChunked: true,
  }

  // Collect portals from loaded chunks
  syncPortalsFromChunks(world)

  return { world, buildingRegistry: collectBuildingRegistry(world), districtMap: null }
}

export function syncPortalsFromChunks(world) {
  world.portals = []
  for (const [, chunk] of world.chunkCache.cache) {
    for (const p of chunk.portals) {
      world.portals.push({
        x: p.wx,
        y: p.wy,
        building: p.building,
      })
    }
  }
}

export function collectBuildingRegistry(world) {
  const buildings = []
  for (const [, chunk] of world.chunkCache.cache) {
    for (const p of chunk.portals) {
      if (p.building) buildings.push(p.building)
    }
  }
  return buildings
}

export function ensureAreaLoaded(world, x, y, radius) {
  if (!world.isChunked) return
  ensureChunksLoaded(world.chunkCache, x, y, radius)
}

export function getTile(world, x, y) {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return TILE.MOUNTAIN
  const key = y * world.width + x
  if (world.tileOverrides && world.tileOverrides.has(key)) {
    return world.tileOverrides.get(key)
  }
  if (world.isChunked) {
    return chunkGetTile(world.chunkCache, x, y, world.width, world.height)
  }
  return world.tiles[y * world.width + x]
}

export function setTile(world, x, y, tileId) {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return
  const key = y * world.width + x
  if (!world.tileOverrides) world.tileOverrides = new Map()
  world.tileOverrides.set(key, tileId)
  // Also write to chunk if loaded for consistency
  if (world.isChunked) {
    const cx = x >> CHUNK_BITS
    const cy = y >> CHUNK_BITS
    const chunk = world.chunkCache.getIfLoaded(cx, cy)
    if (chunk) {
      chunk.tiles[(y & CHUNK_MASK) * CHUNK_SIZE + (x & CHUNK_MASK)] = tileId
    }
  }
}

export function isSolid(world, x, y) {
  const id = getTile(world, x, y)
  return getTileDef(id).solid
}

export function getChunkPortals(world, x, y) {
  if (!world.isChunked) return []
  const cx = x >> CHUNK_BITS
  const cy = y >> CHUNK_BITS
  const chunk = world.chunkCache.getIfLoaded(cx, cy)
  if (!chunk) return []
  return chunk.portals
}
