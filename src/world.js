import { TILE, getTileDef } from './tiles.js'

const W = 800
const H = 800

// Seeded PRNG for deterministic generation
function mulberry32(seed) {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function noise2(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function fbm(x, y) {
  let v = 0
  let a = 0.5
  for (let i = 0; i < 4; i++) {
    v += a * noise2(x * (1 << i), y * (1 << i))
    a *= 0.5
  }
  return v
}

// District IDs
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

/**
 * @typedef {{
 *   id: string, x: number, y: number, w: number, h: number,
 *   doorX: number, doorY: number, district: number, type: string
 * }} BuildingInfo
 */

/**
 * @returns {{
 *   world: { id: string, name: string, width: number, height: number, tiles: Uint16Array, portals: any[], entities: { list: any[] } },
 *   buildingRegistry: BuildingInfo[],
 *   districtMap: Uint8Array
 * }}
 */
export function generateWorld() {
  const tiles = new Uint16Array(W * H)
  const districtMap = new Uint8Array(W * H)
  const rng = mulberry32(42)

  // City center and wall boundaries
  const cx = (W / 2) | 0
  const cy = (H / 2) | 0
  const wallInset = 60
  const wallX0 = wallInset
  const wallY0 = wallInset
  const wallX1 = W - wallInset - 1
  const wallY1 = H - wallInset - 1

  // --- Pass 1: Fill with wilderness terrain outside walls ---
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x * 0.08
      const ny = y * 0.08
      const n = fbm(nx, ny)
      const wave = Math.sin(x * 0.12) + Math.sin(y * 0.11)
      const v = noise2(x * 0.29, y * 0.37)

      let t = TILE.GRASS
      if (wave < -1.4) {
        t = v < 0.33 ? TILE.WATER : v < 0.66 ? TILE.WATER_B : TILE.WATER_C
      } else if (n > 0.72) {
        t = v < 0.33 ? TILE.MOUNTAIN : v < 0.66 ? TILE.MOUNTAIN_B : TILE.MOUNTAIN_C
      } else if (n > 0.52 && n <= 0.62) {
        t = v < 0.34 ? TILE.DENSE_FOREST : v < 0.67 ? TILE.TREE_B : TILE.TREE_C
      } else if (noise2(x * 3.1, y * 3.7) > 0.93) {
        t = v < 0.5 ? TILE.FLOWER : TILE.FLOWER_B
      } else {
        t = v < 0.33 ? TILE.GRASS : v < 0.66 ? TILE.GRASS_B : TILE.GRASS_C
      }

      tiles[y * W + x] = t
      districtMap[y * W + x] = DISTRICT.WILDERNESS
    }
  }

  // --- Pass 2: Fill city interior with cobblestone ---
  for (let y = wallY0 + 1; y < wallY1; y++) {
    for (let x = wallX0 + 1; x < wallX1; x++) {
      tiles[y * W + x] = rng() < 0.5 ? TILE.COBBLE : TILE.COBBLE_B
      districtMap[y * W + x] = DISTRICT.RESIDENTIAL
    }
  }

  // --- Assign districts (6 zones in a 2x3 grid within the walls) ---
  const cityW = wallX1 - wallX0 - 1
  const cityH = wallY1 - wallY0 - 1
  const dCols = 3
  const dRows = 2
  const dw = (cityW / dCols) | 0
  const dh = (cityH / dRows) | 0
  const districtGrid = [
    [DISTRICT.MILITARY, DISTRICT.NOBLE, DISTRICT.TEMPLE],
    [DISTRICT.SLUMS, DISTRICT.MARKET, DISTRICT.RESIDENTIAL],
  ]
  for (let y = wallY0 + 1; y < wallY1; y++) {
    for (let x = wallX0 + 1; x < wallX1; x++) {
      const lx = x - wallX0 - 1
      const ly = y - wallY0 - 1
      const dc = Math.min((lx / dw) | 0, dCols - 1)
      const dr = Math.min((ly / dh) | 0, dRows - 1)
      districtMap[y * W + x] = districtGrid[dr][dc]
    }
  }

  // --- Pass 3: City walls ---
  for (let x = wallX0; x <= wallX1; x++) {
    tiles[wallY0 * W + x] = TILE.CASTLE_WALL
    tiles[wallY1 * W + x] = TILE.CASTLE_WALL
  }
  for (let y = wallY0; y <= wallY1; y++) {
    tiles[y * W + wallX0] = TILE.CASTLE_WALL
    tiles[y * W + wallX1] = TILE.CASTLE_WALL
  }

  // Gate openings (3-wide gaps) on each wall
  const gateHalf = 1
  const gates = [
    { axis: 'h', fixed: wallY0, pos: cx },   // North gate
    { axis: 'h', fixed: wallY1, pos: cx },   // South gate
    { axis: 'v', fixed: wallX0, pos: cy },   // West gate
    { axis: 'v', fixed: wallX1, pos: cy },   // East gate
  ]
  for (const g of gates) {
    if (g.axis === 'h') {
      for (let dx = -gateHalf; dx <= gateHalf; dx++) {
        tiles[g.fixed * W + g.pos + dx] = TILE.GATE
      }
    } else {
      for (let dy = -gateHalf; dy <= gateHalf; dy++) {
        tiles[(g.pos + dy) * W + g.fixed] = TILE.GATE
      }
    }
  }

  // Clear walkable paths from gates to outside
  for (const g of gates) {
    if (g.axis === 'h') {
      const dir = g.fixed === wallY0 ? -1 : 1
      for (let d = 1; d <= 15; d++) {
        const gy = g.fixed + d * dir
        if (gy < 0 || gy >= H) break
        for (let dx = -gateHalf; dx <= gateHalf; dx++) {
          const gx = g.pos + dx
          if (gx < 0 || gx >= W) continue
          tiles[gy * W + gx] = TILE.PATH
        }
      }
    } else {
      const dir = g.fixed === wallX0 ? -1 : 1
      for (let d = 1; d <= 15; d++) {
        const gx = g.fixed + d * dir
        if (gx < 0 || gx >= W) break
        for (let dy = -gateHalf; dy <= gateHalf; dy++) {
          const gy = g.pos + dy
          if (gy < 0 || gy >= H) continue
          tiles[gy * W + gx] = TILE.PATH
        }
      }
    }
  }

  // --- Pass 4: Road network inside city ---
  const mainInterval = 40
  const alleyInterval = 15

  // Main boulevards
  for (let y = wallY0 + 1; y < wallY1; y++) {
    for (let x = wallX0 + 1; x < wallX1; x++) {
      const lx = x - wallX0
      const ly = y - wallY0
      const isMainH = ly % mainInterval < 2
      const isMainV = lx % mainInterval < 2
      const isAlleyH = ly % alleyInterval === 0
      const isAlleyV = lx % alleyInterval === 0
      if (isMainH || isMainV) {
        tiles[y * W + x] = TILE.COBBLE
      } else if (isAlleyH || isAlleyV) {
        tiles[y * W + x] = rng() < 0.6 ? TILE.COBBLE : TILE.COBBLE_B
      }
    }
  }

  // Central cross road leading to gates
  for (let x = wallX0 + 1; x < wallX1; x++) {
    tiles[cy * W + x] = TILE.COBBLE
    tiles[(cy - 1) * W + x] = TILE.COBBLE
  }
  for (let y = wallY0 + 1; y < wallY1; y++) {
    tiles[y * W + cx] = TILE.COBBLE
    tiles[y * W + cx - 1] = TILE.COBBLE
  }

  // --- Pass 5: Castle compound (center-north) ---
  const castleW = 50
  const castleH = 40
  const castleX = cx - (castleW >> 1)
  const castleY = wallY0 + 20

  for (let y = castleY; y < castleY + castleH; y++) {
    for (let x = castleX; x < castleX + castleW; x++) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      const edge =
        x === castleX || x === castleX + castleW - 1 ||
        y === castleY || y === castleY + castleH - 1
      if (edge) {
        tiles[y * W + x] = TILE.CASTLE_WALL
      } else {
        tiles[y * W + x] = TILE.COBBLE
      }
      districtMap[y * W + x] = DISTRICT.NOBLE
    }
  }

  // Castle gate (south wall, centered)
  const castleGateX = castleX + (castleW >> 1)
  const castleGateY = castleY + castleH - 1
  for (let dx = -1; dx <= 1; dx++) {
    tiles[castleGateY * W + castleGateX + dx] = TILE.GATE
  }
  // Path from castle gate to central road
  for (let y = castleGateY + 1; y <= cy; y++) {
    tiles[y * W + castleGateX] = TILE.COBBLE
    tiles[y * W + castleGateX - 1] = TILE.COBBLE
  }

  // Castle corner towers (4x4 solid blocks at corners)
  const towerPositions = [
    [castleX, castleY],
    [castleX + castleW - 4, castleY],
    [castleX, castleY + castleH - 4],
    [castleX + castleW - 4, castleY + castleH - 4],
  ]
  for (const [tx, ty] of towerPositions) {
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        tiles[(ty + dy) * W + tx + dx] = TILE.CASTLE_WALL
      }
    }
  }

  // Castle courtyard (inner area)
  const courtX = castleX + 8
  const courtY = castleY + 6
  const courtW = castleW - 16
  const courtH = castleH - 14
  for (let y = courtY; y < courtY + courtH; y++) {
    for (let x = courtX; x < courtX + courtW; x++) {
      tiles[y * W + x] = TILE.FLOOR
    }
  }

  // --- Pass 6: Green spaces (parks) ---
  const parkSpots = [
    { x: wallX0 + 30, y: wallY0 + 30, w: 20, h: 15 },
    { x: wallX1 - 50, y: wallY1 - 50, w: 18, h: 18 },
    { x: wallX0 + 80, y: wallY1 - 40, w: 15, h: 12 },
    { x: wallX1 - 90, y: wallY0 + 50, w: 16, h: 14 },
  ]
  for (const park of parkSpots) {
    for (let y = park.y; y < park.y + park.h && y < wallY1; y++) {
      for (let x = park.x; x < park.x + park.w && x < wallX1; x++) {
        if (x <= wallX0 || y <= wallY0) continue
        const v = rng()
        if (v < 0.15) tiles[y * W + x] = TILE.FLOWER
        else if (v < 0.25) tiles[y * W + x] = TILE.FLOWER_B
        else if (v < 0.35) tiles[y * W + x] = TILE.TREE_B
        else tiles[y * W + x] = rng() < 0.5 ? TILE.GRASS : TILE.GRASS_B
      }
    }
  }

  // --- Pass 7: Place buildings along roads ---
  /** @type {BuildingInfo[]} */
  const buildingRegistry = []
  let buildingId = 0

  const buildingTypes = ['house', 'house', 'house', 'shop', 'shop', 'tavern', 'blacksmith', 'temple', 'barracks', 'noble_house']
  const districtBuildingWeights = {
    [DISTRICT.MARKET]: ['shop', 'shop', 'shop', 'tavern', 'house'],
    [DISTRICT.RESIDENTIAL]: ['house', 'house', 'house', 'house', 'shop'],
    [DISTRICT.NOBLE]: ['noble_house', 'noble_house', 'house', 'temple'],
    [DISTRICT.SLUMS]: ['house', 'house', 'house', 'tavern', 'house'],
    [DISTRICT.TEMPLE]: ['temple', 'temple', 'house', 'house', 'noble_house'],
    [DISTRICT.MILITARY]: ['barracks', 'barracks', 'blacksmith', 'house', 'house'],
  }

  function isAreaClear(ax, ay, aw, ah) {
    for (let y = ay - 1; y <= ay + ah; y++) {
      for (let x = ax - 1; x <= ax + aw; x++) {
        if (x <= wallX0 + 1 || x >= wallX1 - 1 || y <= wallY0 + 1 || y >= wallY1 - 1) return false
        // Don't build over the central cross roads (2-wide)
        if ((x === cx || x === cx - 1) && y > wallY0 && y < wallY1) return false
        if ((y === cy || y === cy - 1) && x > wallX0 && x < wallX1) return false
        const t = tiles[y * W + x]
        if (
          t === TILE.CASTLE_WALL || t === TILE.GATE ||
          t === TILE.BOX_H || t === TILE.BOX_V ||
          t === TILE.BOX_NW || t === TILE.BOX_NE ||
          t === TILE.BOX_SW || t === TILE.BOX_SE ||
          t === TILE.DOOR || t === TILE.FLOOR ||
          t === TILE.WATER || t === TILE.WATER_B || t === TILE.WATER_C
        ) {
          return false
        }
      }
    }
    return true
  }

  function stampBuilding(bx, by, bw, bh, type) {
    for (let y = by; y < by + bh; y++) {
      for (let x = bx; x < bx + bw; x++) {
        if (x < 0 || x >= W || y < 0 || y >= H) continue
        const edge = x === bx || x === bx + bw - 1 || y === by || y === by + bh - 1
        if (edge) {
          let t = TILE.BOX_H
          if (x === bx && y === by) t = TILE.BOX_NW
          else if (x === bx + bw - 1 && y === by) t = TILE.BOX_NE
          else if (x === bx && y === by + bh - 1) t = TILE.BOX_SW
          else if (x === bx + bw - 1 && y === by + bh - 1) t = TILE.BOX_SE
          else if (y === by || y === by + bh - 1) t = TILE.BOX_H
          else t = TILE.BOX_V
          tiles[y * W + x] = t
        } else {
          tiles[y * W + x] = TILE.FLOOR
        }
      }
    }

    // Place door on south wall, centered
    const doorX = bx + ((bw >> 1) | 0)
    const doorY = by + bh - 1
    tiles[doorY * W + doorX] = TILE.DOOR

    // Ensure walkable tile in front of door
    if (doorY + 1 < H) {
      const below = tiles[(doorY + 1) * W + doorX]
      if (getTileDef(below).solid) {
        tiles[(doorY + 1) * W + doorX] = TILE.COBBLE
      }
    }

    const dist = districtMap[by * W + bx]
    const info = {
      id: `bld_${buildingId++}`,
      x: bx, y: by, w: bw, h: bh,
      doorX, doorY,
      district: dist,
      type,
    }
    buildingRegistry.push(info)
    return info
  }

  // Place buildings in a grid-like pattern along alleys
  const minBW = 5
  const maxBW = 10
  const minBH = 4
  const maxBH = 8

  for (let gy = wallY0 + 5; gy < wallY1 - 10; gy += 8) {
    for (let gx = wallX0 + 5; gx < wallX1 - 12; gx += 12) {
      // Skip castle area
      if (gx >= castleX - 2 && gx <= castleX + castleW + 2 &&
          gy >= castleY - 2 && gy <= castleY + castleH + 2) continue

      // Skip parks
      let inPark = false
      for (const park of parkSpots) {
        if (gx >= park.x - 2 && gx <= park.x + park.w + 2 &&
            gy >= park.y - 2 && gy <= park.y + park.h + 2) {
          inPark = true
          break
        }
      }
      if (inPark) continue

      // Jitter position
      const jx = gx + ((rng() * 4) | 0) - 2
      const jy = gy + ((rng() * 3) | 0) - 1

      const bw = minBW + ((rng() * (maxBW - minBW)) | 0)
      const bh = minBH + ((rng() * (maxBH - minBH)) | 0)

      if (!isAreaClear(jx, jy, bw, bh)) continue

      const dist = districtMap[jy * W + jx]
      if (dist === DISTRICT.WILDERNESS) continue

      const weights = districtBuildingWeights[dist] || buildingTypes
      const type = weights[((rng() * weights.length) | 0)]

      stampBuilding(jx, jy, bw, bh, type)
    }
  }

  // --- Pass 8: Dungeon entrances ---
  const dungeonSpots = [
    { x: wallX0 + 15, y: wallY1 - 15 },
    { x: wallX1 - 15, y: wallY0 + 15 },
    { x: cx, y: wallY1 - 12 },
  ]
  for (let i = 0; i < dungeonSpots.length; i++) {
    const ds = dungeonSpots[i]
    tiles[ds.y * W + ds.x] = TILE.STAIR_DOWN
    buildingRegistry.push({
      id: `dungeon_${i}`,
      x: ds.x, y: ds.y, w: 1, h: 1,
      doorX: ds.x, doorY: ds.y,
      district: districtMap[ds.y * W + ds.x],
      type: 'dungeon',
    })
  }

  // --- Pass 9: Castle interior rooms registered as buildings ---
  const castleRooms = [
    { id: 'castle_throne', x: castleX + 15, y: castleY + 3, w: 20, h: 12, type: 'castle_throne' },
    { id: 'castle_chamber1', x: castleX + 5, y: castleY + 3, w: 8, h: 8, type: 'castle_chamber' },
    { id: 'castle_chamber2', x: castleX + castleW - 13, y: castleY + 3, w: 8, h: 8, type: 'castle_chamber' },
  ]
  for (const cr of castleRooms) {
    // Stamp as sub-buildings inside castle
    for (let y = cr.y; y < cr.y + cr.h; y++) {
      for (let x = cr.x; x < cr.x + cr.w; x++) {
        if (x < 0 || x >= W || y < 0 || y >= H) continue
        const edge = x === cr.x || x === cr.x + cr.w - 1 || y === cr.y || y === cr.y + cr.h - 1
        if (edge) {
          tiles[y * W + x] = TILE.CASTLE_WALL
        } else {
          tiles[y * W + x] = TILE.CARPET
        }
      }
    }
    const doorX = cr.x + ((cr.w >> 1) | 0)
    const doorY = cr.y + cr.h - 1
    tiles[doorY * W + doorX] = TILE.DOOR
    if (doorY + 1 < H) tiles[(doorY + 1) * W + doorX] = TILE.COBBLE

    buildingRegistry.push({
      id: cr.id,
      x: cr.x, y: cr.y, w: cr.w, h: cr.h,
      doorX, doorY,
      district: DISTRICT.NOBLE,
      type: cr.type,
    })
  }

  // --- Pass 10: Market stalls in market district ---
  const marketCx = wallX0 + 1 + dw + (dw >> 1)
  const marketCy = wallY0 + 1 + dh + (dh >> 1)
  for (let dy = -10; dy <= 10; dy += 5) {
    for (let dx = -12; dx <= 12; dx += 6) {
      const sx = marketCx + dx
      const sy = marketCy + dy
      if (sx > wallX0 && sx < wallX1 && sy > wallY0 && sy < wallY1) {
        const t = tiles[sy * W + sx]
        if (t === TILE.COBBLE || t === TILE.COBBLE_B) {
          tiles[sy * W + sx] = TILE.MARKET_STALL
        }
      }
    }
  }

  // --- Final: Clear spawn area around central intersection ---
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 6; dx++) {
      const sx = cx + dx
      const sy = cy + dy
      if (sx <= wallX0 || sx >= wallX1 || sy <= wallY0 || sy >= wallY1) continue
      const t = tiles[sy * W + sx]
      if (getTileDef(t).solid && t !== TILE.CASTLE_WALL) {
        tiles[sy * W + sx] = TILE.COBBLE
      }
    }
  }

  const world = {
    id: 'overworld',
    name: 'City of Stonehaven',
    width: W,
    height: H,
    tiles,
    portals: [],
    entities: { list: [] },
    spatialHash: null,
  }

  return { world, buildingRegistry, districtMap }
}

export function getTile(world, x, y) {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return TILE.MOUNTAIN
  return world.tiles[y * world.width + x]
}

export function isSolid(world, x, y) {
  const id = getTile(world, x, y)
  return getTileDef(id).solid
}
