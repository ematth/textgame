import { TILE } from './tiles.js'
import { BIOME, getBiome } from './biomes.js'

const CHUNK_BITS = 7
const CHUNK_SIZE = 1 << CHUNK_BITS
const CHUNK_MASK = CHUNK_SIZE - 1

// Region = 1024x1024 tiles = 8x8 chunks. Structures are placed per-region.
const REGION_SIZE = 1024
const REGION_BITS = 10

// Seeded hash for deterministic POI placement
function hashRegion(rx, ry, seed, salt) {
  let h = seed ^ (rx * 374761393) ^ (ry * 668265263) ^ (salt * 1234567)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h = h ^ (h >>> 16)
  return (h >>> 0) / 4294967296
}

function regionRng(rx, ry, seed) {
  let s = (seed ^ (rx * 374761393) ^ (ry * 668265263)) | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const POI_TYPE = {
  VILLAGE: 'village',
  TOWN: 'town',
  CITY: 'city',
  CASTLE: 'castle',
  CAVE: 'cave',
  DUNGEON: 'dungeon',
}

// Biomes where each POI type can appear
const POI_BIOME_RULES = {
  [POI_TYPE.VILLAGE]: [BIOME.PLAINS, BIOME.FOREST, BIOME.TAIGA, BIOME.DESERT, BIOME.JUNGLE],
  [POI_TYPE.TOWN]: [BIOME.PLAINS, BIOME.FOREST, BIOME.DESERT],
  [POI_TYPE.CITY]: [BIOME.PLAINS, BIOME.FOREST],
  [POI_TYPE.CASTLE]: [BIOME.PLAINS, BIOME.FOREST, BIOME.MOUNTAINS, BIOME.TAIGA, BIOME.TUNDRA],
  [POI_TYPE.CAVE]: [BIOME.MOUNTAINS, BIOME.SNOWY_PEAKS, BIOME.FOREST, BIOME.TAIGA],
  [POI_TYPE.DUNGEON]: [BIOME.PLAINS, BIOME.FOREST, BIOME.DESERT, BIOME.SWAMP, BIOME.TUNDRA],
}

const WORLD_CENTER = 25000

// Global POI registry - populated lazily per region
const _regionCache = new Map()

function getRegionPOIs(rx, ry, worldSeed) {
  const key = (rx << 16) ^ ry
  let cached = _regionCache.get(key)
  if (cached) return cached

  cached = generateRegionPOIs(rx, ry, worldSeed)
  _regionCache.set(key, cached)
  return cached
}

function generateRegionPOIs(rx, ry, worldSeed) {
  const pois = []
  const rng = regionRng(rx, ry, worldSeed)
  const baseX = rx * REGION_SIZE
  const baseY = ry * REGION_SIZE
  const centerBiome = getBiome(baseX + REGION_SIZE / 2, baseY + REGION_SIZE / 2)

  // Check if center region -> always spawn Stonehaven
  const centerRX = Math.floor(WORLD_CENTER / REGION_SIZE)
  const centerRY = Math.floor(WORLD_CENTER / REGION_SIZE)
  if (rx === centerRX && ry === centerRY) {
    pois.push({
      type: POI_TYPE.CITY,
      x: WORLD_CENTER - 100,
      y: WORLD_CENTER - 100,
      w: 200,
      h: 200,
      name: 'Stonehaven',
      seed: worldSeed ^ 999,
    })
    return pois
  }

  // Determine what this region gets
  const roll = hashRegion(rx, ry, worldSeed, 0)
  const roll2 = hashRegion(rx, ry, worldSeed, 1)

  // City: very rare, only in suitable biomes
  if (roll < 0.0005 && POI_BIOME_RULES[POI_TYPE.CITY].includes(centerBiome)) {
    const px = baseX + 100 + (rng() * (REGION_SIZE - 400)) | 0
    const py = baseY + 100 + (rng() * (REGION_SIZE - 400)) | 0
    pois.push({ type: POI_TYPE.CITY, x: px, y: py, w: 200, h: 200, name: cityName(rx, ry), seed: worldSeed ^ (rx * 31 + ry) })
    return pois
  }

  // Town
  if (roll < 0.006 && POI_BIOME_RULES[POI_TYPE.TOWN].includes(centerBiome)) {
    const px = baseX + 50 + (rng() * (REGION_SIZE - 200)) | 0
    const py = baseY + 50 + (rng() * (REGION_SIZE - 200)) | 0
    pois.push({ type: POI_TYPE.TOWN, x: px, y: py, w: 80, h: 80, name: townName(rx, ry), seed: worldSeed ^ (rx * 17 + ry * 13) })
  }

  // Village
  if (roll2 < 0.04 && POI_BIOME_RULES[POI_TYPE.VILLAGE].includes(centerBiome)) {
    const px = baseX + 20 + (rng() * (REGION_SIZE - 80)) | 0
    const py = baseY + 20 + (rng() * (REGION_SIZE - 80)) | 0
    pois.push({ type: POI_TYPE.VILLAGE, x: px, y: py, w: 40, h: 40, name: villageName(rx, ry), seed: worldSeed ^ (rx * 7 + ry * 23) })
  }

  // Castle
  if (hashRegion(rx, ry, worldSeed, 2) < 0.01 && POI_BIOME_RULES[POI_TYPE.CASTLE].includes(centerBiome)) {
    const px = baseX + 30 + (rng() * (REGION_SIZE - 100)) | 0
    const py = baseY + 30 + (rng() * (REGION_SIZE - 100)) | 0
    pois.push({ type: POI_TYPE.CASTLE, x: px, y: py, w: 40, h: 40, name: castleName(rx, ry), seed: worldSeed ^ (rx * 41 + ry * 37) })
  }

  // Cave entrance
  if (hashRegion(rx, ry, worldSeed, 3) < 0.05 && POI_BIOME_RULES[POI_TYPE.CAVE].includes(centerBiome)) {
    const px = baseX + 10 + (rng() * (REGION_SIZE - 20)) | 0
    const py = baseY + 10 + (rng() * (REGION_SIZE - 20)) | 0
    pois.push({ type: POI_TYPE.CAVE, x: px, y: py, w: 1, h: 1, name: 'Cave', seed: worldSeed ^ (rx * 53 + ry * 59) })
  }

  // Dungeon entrance
  if (hashRegion(rx, ry, worldSeed, 4) < 0.02 && POI_BIOME_RULES[POI_TYPE.DUNGEON].includes(centerBiome)) {
    const px = baseX + 10 + (rng() * (REGION_SIZE - 20)) | 0
    const py = baseY + 10 + (rng() * (REGION_SIZE - 20)) | 0
    pois.push({ type: POI_TYPE.DUNGEON, x: px, y: py, w: 1, h: 1, name: 'Dungeon', seed: worldSeed ^ (rx * 67 + ry * 71) })
  }

  return pois
}

// Name generators
const CITY_PREFIX = ['Stone', 'Iron', 'Silver', 'Gold', 'Dragon', 'Eagle', 'Crown', 'Storm', 'Frost', 'Shadow', 'Sun', 'Moon', 'Star', 'Thunder', 'Dawn']
const CITY_SUFFIX = ['haven', 'hold', 'gate', 'keep', 'reach', 'ford', 'fall', 'vale', 'ward', 'rest', 'peak', 'helm', 'guard', 'port', 'field']
const VILLAGE_PREFIX = ['Green', 'Oak', 'Elm', 'Willow', 'Mill', 'Brook', 'Moss', 'Fern', 'Ash', 'Briar', 'Thorn', 'Honey', 'Meadow', 'Raven', 'Fox']
const VILLAGE_SUFFIX = ['dale', 'wick', 'ton', 'bury', 'ham', 'wood', 'bridge', 'hollow', 'creek', 'grove', 'hill', 'ford', 'moor', 'glen', 'stead']
const CASTLE_PREFIX = ['Black', 'White', 'Red', 'Grey', 'Dark', 'High', 'Old', 'North', 'South', 'East', 'West', 'Bright', 'Iron', 'Steel', 'Blood']
const CASTLE_SUFFIX = [' Keep', ' Fortress', ' Citadel', ' Tower', ' Hold', ' Bastion', 'watch', ' Castle', ' Stronghold', ' Spire']

function pickName(prefix, suffix, rx, ry) {
  const h1 = ((rx * 2654435761 + ry * 2246822519) >>> 0) % prefix.length
  const h2 = ((rx * 951274213 + ry * 3266489917) >>> 0) % suffix.length
  return prefix[h1] + suffix[h2]
}

function cityName(rx, ry) { return pickName(CITY_PREFIX, CITY_SUFFIX, rx, ry) }
function townName(rx, ry) { return pickName(CITY_PREFIX, CITY_SUFFIX, rx + 100, ry + 100) }
function villageName(rx, ry) { return pickName(VILLAGE_PREFIX, VILLAGE_SUFFIX, rx, ry) }
function castleName(rx, ry) { return pickName(CASTLE_PREFIX, CASTLE_SUFFIX, rx, ry) }

// Get all structures that could overlap a given chunk
export function getStructuresForChunk(cx, cy, worldSeed) {
  const chunkX0 = cx * CHUNK_SIZE
  const chunkY0 = cy * CHUNK_SIZE
  const chunkX1 = chunkX0 + CHUNK_SIZE
  const chunkY1 = chunkY0 + CHUNK_SIZE

  // Check all regions that could have a structure overlapping this chunk
  // A structure can be up to ~200 tiles wide, so check 1 region radius
  const rx0 = Math.floor((chunkX0 - 200) / REGION_SIZE)
  const ry0 = Math.floor((chunkY0 - 200) / REGION_SIZE)
  const rx1 = Math.floor((chunkX1 + 200) / REGION_SIZE)
  const ry1 = Math.floor((chunkY1 + 200) / REGION_SIZE)

  const result = []
  for (let ry = ry0; ry <= ry1; ry++) {
    for (let rx = rx0; rx <= rx1; rx++) {
      const pois = getRegionPOIs(rx, ry, worldSeed)
      for (const poi of pois) {
        if (poi.x + poi.w > chunkX0 && poi.x < chunkX1 &&
            poi.y + poi.h > chunkY0 && poi.y < chunkY1) {
          result.push(poi)
        }
      }
    }
  }
  return result
}

// Get all POIs in a world-coordinate rectangle (for the world map)
export function getPOIsInRect(x0, y0, x1, y1, worldSeed) {
  const rx0 = Math.floor((x0 - 200) / REGION_SIZE)
  const ry0 = Math.floor((y0 - 200) / REGION_SIZE)
  const rx1 = Math.floor((x1 + 200) / REGION_SIZE)
  const ry1 = Math.floor((y1 + 200) / REGION_SIZE)

  const result = []
  for (let ry = ry0; ry <= ry1; ry++) {
    for (let rx = rx0; rx <= rx1; rx++) {
      const pois = getRegionPOIs(rx, ry, worldSeed)
      for (const poi of pois) {
        if (poi.x + poi.w > x0 && poi.x < x1 && poi.y + poi.h > y0 && poi.y < y1) {
          result.push(poi)
        }
      }
    }
  }
  return result
}

export function stampStructure(chunk, poi, worldSeed) {
  const gen = STRUCTURE_GENERATORS[poi.type]
  if (gen) gen(chunk, poi, worldSeed)
}

// --- Structure generators: stamp tiles into chunks ---

function localRng(seed) {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function setTile(chunk, wx, wy, tile) {
  const baseX = chunk.cx * CHUNK_SIZE
  const baseY = chunk.cy * CHUNK_SIZE
  const lx = wx - baseX
  const ly = wy - baseY
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE) return
  chunk.tiles[ly * CHUNK_SIZE + lx] = tile
}

function getTileFromChunk(chunk, wx, wy) {
  const baseX = chunk.cx * CHUNK_SIZE
  const baseY = chunk.cy * CHUNK_SIZE
  const lx = wx - baseX
  const ly = wy - baseY
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE) return -1
  return chunk.tiles[ly * CHUNK_SIZE + lx]
}

const STRUCTURE_GENERATORS = {
  [POI_TYPE.VILLAGE](chunk, poi) {
    const rng = localRng(poi.seed)
    const { x, y, w, h } = poi

    // Lay a simple dirt path cross through the village
    const cx = x + (w >> 1)
    const cy = y + (h >> 1)
    for (let dx = x + 3; dx < x + w - 3; dx++) setTile(chunk, dx, cy, TILE.PATH)
    for (let dy = y + 3; dy < y + h - 3; dy++) setTile(chunk, cx, dy, TILE.PATH)

    // Place small buildings
    const buildings = []
    for (let attempt = 0; attempt < 40; attempt++) {
      const bw = 5 + ((rng() * 4) | 0)
      const bh = 4 + ((rng() * 3) | 0)
      const bx = x + 2 + ((rng() * (w - bw - 4)) | 0)
      const by = y + 2 + ((rng() * (h - bh - 4)) | 0)

      // Check overlap with path and other buildings
      let blocked = false
      for (const b of buildings) {
        if (bx < b.x + b.w + 1 && bx + bw + 1 > b.x && by < b.y + b.h + 1 && by + bh + 1 > b.y) {
          blocked = true; break
        }
      }
      if (Math.abs(bx + bw / 2 - cx) < bw / 2 + 1 && Math.abs(by + bh / 2 - cy) < bh + 1) blocked = true
      if (blocked) continue

      stampSmallBuilding(chunk, bx, by, bw, bh, rng)
      const doorX = bx + (bw >> 1)
      const doorY = by + bh - 1
      const types = ['house', 'house', 'house', 'shop', 'tavern']
      buildings.push({
        x: bx, y: by, w: bw, h: bh, doorX, doorY,
        type: types[(rng() * types.length) | 0],
        id: `village_${poi.name}_${buildings.length}`,
        name: poi.name,
      })
    }

    chunk.portals.push(...buildings.map(b => ({
      wx: b.doorX, wy: b.doorY,
      building: {
        id: b.id, x: b.x, y: b.y, w: b.w, h: b.h,
        doorX: b.doorX, doorY: b.doorY,
        district: 0, type: b.type,
      }
    })))
  },

  [POI_TYPE.TOWN](chunk, poi) {
    const rng = localRng(poi.seed)
    const { x, y, w, h } = poi

    // Walls around town
    for (let dx = 0; dx < w; dx++) {
      setTile(chunk, x + dx, y, TILE.CASTLE_WALL)
      setTile(chunk, x + dx, y + h - 1, TILE.CASTLE_WALL)
    }
    for (let dy = 0; dy < h; dy++) {
      setTile(chunk, x, y + dy, TILE.CASTLE_WALL)
      setTile(chunk, x + w - 1, y + dy, TILE.CASTLE_WALL)
    }

    // Fill interior with cobble
    for (let dy = 1; dy < h - 1; dy++) {
      for (let dx = 1; dx < w - 1; dx++) {
        setTile(chunk, x + dx, y + dy, rng() < 0.5 ? TILE.COBBLE : TILE.COBBLE_B)
      }
    }

    // Gates (one on each side)
    const mx = x + (w >> 1), my = y + (h >> 1)
    for (let d = -1; d <= 1; d++) {
      setTile(chunk, mx + d, y, TILE.GATE)
      setTile(chunk, mx + d, y + h - 1, TILE.GATE)
      setTile(chunk, x, my + d, TILE.GATE)
      setTile(chunk, x + w - 1, my + d, TILE.GATE)
    }

    // Roads
    for (let dx = 1; dx < w - 1; dx++) setTile(chunk, x + dx, my, TILE.COBBLE)
    for (let dy = 1; dy < h - 1; dy++) setTile(chunk, mx, y + dy, TILE.COBBLE)

    // Paths outside gates
    for (let d = 1; d <= 8; d++) {
      for (let off = -1; off <= 1; off++) {
        setTile(chunk, mx + off, y - d, TILE.PATH)
        setTile(chunk, mx + off, y + h - 1 + d, TILE.PATH)
        setTile(chunk, x - d, my + off, TILE.PATH)
        setTile(chunk, x + w - 1 + d, my + off, TILE.PATH)
      }
    }

    // Buildings inside
    const buildings = []
    for (let attempt = 0; attempt < 80; attempt++) {
      const bw = 5 + ((rng() * 5) | 0)
      const bh = 4 + ((rng() * 4) | 0)
      const bx = x + 3 + ((rng() * (w - bw - 6)) | 0)
      const by = y + 3 + ((rng() * (h - bh - 6)) | 0)

      let blocked = false
      for (const b of buildings) {
        if (bx < b.x + b.w + 1 && bx + bw + 1 > b.x && by < b.y + b.h + 1 && by + bh + 1 > b.y) {
          blocked = true; break
        }
      }
      // Don't build on main roads
      if (bx <= mx && bx + bw > mx && by <= my && by + bh > my) blocked = true
      if (blocked) continue

      stampSmallBuilding(chunk, bx, by, bw, bh, rng)
      const doorX = bx + (bw >> 1)
      const doorY = by + bh - 1
      const types = ['house', 'house', 'shop', 'shop', 'tavern', 'blacksmith', 'temple']
      buildings.push({
        x: bx, y: by, w: bw, h: bh, doorX, doorY,
        type: types[(rng() * types.length) | 0],
        id: `town_${poi.name}_${buildings.length}`,
        name: poi.name,
      })
    }

    chunk.portals.push(...buildings.map(b => ({
      wx: b.doorX, wy: b.doorY,
      building: {
        id: b.id, x: b.x, y: b.y, w: b.w, h: b.h,
        doorX: b.doorX, doorY: b.doorY,
        district: 0, type: b.type,
      }
    })))
  },

  [POI_TYPE.CITY](chunk, poi) {
    const rng = localRng(poi.seed)
    const { x, y, w, h } = poi
    const innerMargin = 2

    // Fill with cobble
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const onEdge = dx === 0 || dx === w - 1 || dy === 0 || dy === h - 1
        if (onEdge) {
          setTile(chunk, x + dx, y + dy, TILE.CASTLE_WALL)
        } else {
          setTile(chunk, x + dx, y + dy, rng() < 0.5 ? TILE.COBBLE : TILE.COBBLE_B)
        }
      }
    }

    // Corner towers (4x4)
    const towers = [[0, 0], [w - 4, 0], [0, h - 4], [w - 4, h - 4]]
    for (const [tx, ty] of towers) {
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          setTile(chunk, x + tx + dx, y + ty + dy, TILE.CASTLE_WALL)
        }
      }
    }

    // Gates (4 sides)
    const mx = (w >> 1), my = (h >> 1)
    for (let d = -1; d <= 1; d++) {
      setTile(chunk, x + mx + d, y, TILE.GATE)
      setTile(chunk, x + mx + d, y + h - 1, TILE.GATE)
      setTile(chunk, x, y + my + d, TILE.GATE)
      setTile(chunk, x + w - 1, y + my + d, TILE.GATE)
    }

    // Main roads
    for (let dx = 1; dx < w - 1; dx++) {
      setTile(chunk, x + dx, y + my, TILE.COBBLE)
      setTile(chunk, x + dx, y + my - 1, TILE.COBBLE)
    }
    for (let dy = 1; dy < h - 1; dy++) {
      setTile(chunk, x + mx, y + dy, TILE.COBBLE)
      setTile(chunk, x + mx - 1, y + dy, TILE.COBBLE)
    }

    // Secondary road grid
    const interval = 20
    for (let dy = 1; dy < h - 1; dy++) {
      for (let dx = 1; dx < w - 1; dx++) {
        if (dx % interval === 0 || dy % interval === 0) {
          setTile(chunk, x + dx, y + dy, TILE.COBBLE)
        }
      }
    }

    // Paths outside gates
    for (let d = 1; d <= 12; d++) {
      for (let off = -1; off <= 1; off++) {
        setTile(chunk, x + mx + off, y - d, TILE.PATH)
        setTile(chunk, x + mx + off, y + h - 1 + d, TILE.PATH)
        setTile(chunk, x - d, y + my + off, TILE.PATH)
        setTile(chunk, x + w - 1 + d, y + my + off, TILE.PATH)
      }
    }

    // Castle compound in center-north
    const castleW = 40
    const castleH = 30
    const castleX = x + mx - (castleW >> 1)
    const castleY = y + 15
    for (let dy = 0; dy < castleH; dy++) {
      for (let dx = 0; dx < castleW; dx++) {
        const onEdge = dx === 0 || dx === castleW - 1 || dy === 0 || dy === castleH - 1
        setTile(chunk, castleX + dx, castleY + dy, onEdge ? TILE.CASTLE_WALL : TILE.FLOOR)
      }
    }
    // Castle gate
    for (let d = -1; d <= 1; d++) {
      setTile(chunk, castleX + (castleW >> 1) + d, castleY + castleH - 1, TILE.GATE)
    }
    // Castle interior: throne area
    const throneX = castleX + (castleW >> 1)
    const throneY = castleY + 3
    setTile(chunk, throneX, throneY, TILE.THRONE)
    setTile(chunk, throneX - 1, throneY, TILE.THRONE)
    // Carpet runner
    for (let dy = 4; dy < castleH - 2; dy++) {
      setTile(chunk, throneX, castleY + dy, TILE.CARPET)
      setTile(chunk, throneX - 1, castleY + dy, TILE.CARPET)
    }
    // Columns
    for (let dy = 5; dy < castleH - 3; dy += 4) {
      setTile(chunk, castleX + 4, castleY + dy, TILE.COLUMN)
      setTile(chunk, castleX + castleW - 5, castleY + dy, TILE.COLUMN)
    }

    // Park areas
    const parks = [
      { px: x + 10, py: y + 10, pw: 15, ph: 12 },
      { px: x + w - 28, py: y + h - 25, pw: 14, ph: 14 },
    ]
    for (const park of parks) {
      for (let dy = 0; dy < park.ph; dy++) {
        for (let dx = 0; dx < park.pw; dx++) {
          const r = rng()
          let t = TILE.GRASS
          if (r < 0.15) t = TILE.FLOWER
          else if (r < 0.25) t = TILE.TREE_B
          else if (r < 0.50) t = TILE.GRASS_B
          setTile(chunk, park.px + dx, park.py + dy, t)
        }
      }
    }

    // Buildings
    const buildings = []
    for (let attempt = 0; attempt < 300; attempt++) {
      const bw = 5 + ((rng() * 6) | 0)
      const bh = 4 + ((rng() * 5) | 0)
      const bx = x + 3 + ((rng() * (w - bw - 6)) | 0)
      const by = y + 3 + ((rng() * (h - bh - 6)) | 0)

      let blocked = false
      // Don't overlap castle
      if (bx < castleX + castleW + 2 && bx + bw > castleX - 2 &&
          by < castleY + castleH + 2 && by + bh > castleY - 2) blocked = true
      // Don't overlap main roads
      if (bx <= x + mx + 1 && bx + bw > x + mx - 1 && by <= y + my + 1 && by + bh > y + my - 1) blocked = true
      // Don't overlap parks
      for (const p of parks) {
        if (bx < p.px + p.pw + 1 && bx + bw > p.px - 1 && by < p.py + p.ph + 1 && by + bh > p.py - 1) {
          blocked = true; break
        }
      }
      // Don't overlap other buildings
      for (const b of buildings) {
        if (bx < b.x + b.w + 1 && bx + bw + 1 > b.x && by < b.y + b.h + 1 && by + bh + 1 > b.y) {
          blocked = true; break
        }
      }
      if (blocked) continue

      stampSmallBuilding(chunk, bx, by, bw, bh, rng)
      const doorX = bx + (bw >> 1)
      const doorY = by + bh - 1
      const types = ['house', 'house', 'house', 'shop', 'shop', 'tavern', 'blacksmith', 'temple', 'noble_house', 'barracks']
      buildings.push({
        x: bx, y: by, w: bw, h: bh, doorX, doorY,
        type: types[(rng() * types.length) | 0],
        id: `city_${poi.name}_${buildings.length}`,
        name: poi.name,
      })
    }

    chunk.portals.push(...buildings.map(b => ({
      wx: b.doorX, wy: b.doorY,
      building: {
        id: b.id, x: b.x, y: b.y, w: b.w, h: b.h,
        doorX: b.doorX, doorY: b.doorY,
        district: 0, type: b.type,
      }
    })))

    // Add dungeon entrances inside city
    const dungeonSpots = [
      { dx: x + 15, dy: y + h - 15 },
      { dx: x + w - 15, dy: y + 15 },
    ]
    for (let i = 0; i < dungeonSpots.length; i++) {
      const ds = dungeonSpots[i]
      setTile(chunk, ds.dx, ds.dy, TILE.STAIR_DOWN)
      chunk.portals.push({
        wx: ds.dx, wy: ds.dy,
        building: {
          id: `city_dungeon_${poi.name}_${i}`,
          x: ds.dx, y: ds.dy, w: 1, h: 1,
          doorX: ds.dx, doorY: ds.dy,
          district: 0, type: 'dungeon',
        }
      })
    }
  },

  [POI_TYPE.CASTLE](chunk, poi) {
    const rng = localRng(poi.seed)
    const { x, y, w, h } = poi

    // Outer walls
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const onEdge = dx === 0 || dx === w - 1 || dy === 0 || dy === h - 1
        if (onEdge) {
          setTile(chunk, x + dx, y + dy, TILE.CASTLE_WALL)
        } else {
          setTile(chunk, x + dx, y + dy, TILE.COBBLE)
        }
      }
    }

    // Corner towers
    const tSize = 3
    const cornerPositions = [[0, 0], [w - tSize, 0], [0, h - tSize], [w - tSize, h - tSize]]
    for (const [tx, ty] of cornerPositions) {
      for (let dy = 0; dy < tSize; dy++) {
        for (let dx = 0; dx < tSize; dx++) {
          setTile(chunk, x + tx + dx, y + ty + dy, TILE.CASTLE_WALL)
        }
      }
    }

    // Gate on south wall
    const gateX = x + (w >> 1)
    for (let d = -1; d <= 1; d++) {
      setTile(chunk, gateX + d, y + h - 1, TILE.GATE)
    }

    // Path from gate
    for (let d = 1; d <= 10; d++) {
      for (let off = -1; off <= 1; off++) {
        setTile(chunk, gateX + off, y + h - 1 + d, TILE.PATH)
      }
    }

    // Inner keep
    const keepW = Math.min(16, w - 8)
    const keepH = Math.min(12, h - 8)
    const keepX = x + (w >> 1) - (keepW >> 1)
    const keepY = y + 4
    for (let dy = 0; dy < keepH; dy++) {
      for (let dx = 0; dx < keepW; dx++) {
        const onEdge = dx === 0 || dx === keepW - 1 || dy === 0 || dy === keepH - 1
        setTile(chunk, keepX + dx, keepY + dy, onEdge ? TILE.CASTLE_WALL : TILE.CARPET)
      }
    }
    // Keep door
    setTile(chunk, keepX + (keepW >> 1), keepY + keepH - 1, TILE.DOOR)
    // Throne
    setTile(chunk, keepX + (keepW >> 1), keepY + 2, TILE.THRONE)

    chunk.portals.push({
      wx: keepX + (keepW >> 1), wy: keepY + keepH - 1,
      building: {
        id: `castle_${poi.name}_keep`,
        x: keepX, y: keepY, w: keepW, h: keepH,
        doorX: keepX + (keepW >> 1), doorY: keepY + keepH - 1,
        district: 0, type: 'castle_throne',
      }
    })
  },

  [POI_TYPE.CAVE](chunk, poi) {
    setTile(chunk, poi.x, poi.y, TILE.CAVE_ENTRANCE)
    chunk.portals.push({
      wx: poi.x, wy: poi.y,
      building: {
        id: `cave_${poi.x}_${poi.y}`,
        x: poi.x, y: poi.y, w: 1, h: 1,
        doorX: poi.x, doorY: poi.y,
        district: 0, type: 'cave',
      }
    })
  },

  [POI_TYPE.DUNGEON](chunk, poi) {
    setTile(chunk, poi.x, poi.y, TILE.STAIR_DOWN)
    chunk.portals.push({
      wx: poi.x, wy: poi.y,
      building: {
        id: `dungeon_${poi.x}_${poi.y}`,
        x: poi.x, y: poi.y, w: 1, h: 1,
        doorX: poi.x, doorY: poi.y,
        district: 0, type: 'dungeon',
      }
    })
  },
}

function stampSmallBuilding(chunk, bx, by, bw, bh, rng) {
  for (let dy = 0; dy < bh; dy++) {
    for (let dx = 0; dx < bw; dx++) {
      const onEdge = dx === 0 || dx === bw - 1 || dy === 0 || dy === bh - 1
      if (onEdge) {
        let t = TILE.BOX_H
        if (dx === 0 && dy === 0) t = TILE.BOX_NW
        else if (dx === bw - 1 && dy === 0) t = TILE.BOX_NE
        else if (dx === 0 && dy === bh - 1) t = TILE.BOX_SW
        else if (dx === bw - 1 && dy === bh - 1) t = TILE.BOX_SE
        else if (dy === 0 || dy === bh - 1) t = TILE.BOX_H
        else t = TILE.BOX_V
        setTile(chunk, bx + dx, by + dy, t)
      } else {
        setTile(chunk, bx + dx, by + dy, TILE.FLOOR)
      }
    }
  }
  // Door on south wall center
  const doorX = bx + (bw >> 1)
  const doorY = by + bh - 1
  setTile(chunk, doorX, doorY, TILE.DOOR)
  // Walkable in front of door
  setTile(chunk, doorX, doorY + 1, TILE.COBBLE)
}
