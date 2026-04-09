import { TILE } from './tiles.js'

/**
 * Create an interior world from a template type and building info.
 * Returns a world object (without spatialHash -- caller builds that).
 */
export function createInterior(buildingInfo, worldManager) {
  const fn = TEMPLATES[buildingInfo.type] || TEMPLATES.house
  const { width, height, tiles, exitX, exitY, name } = fn(buildingInfo)

  const world = {
    id: `interior_${buildingInfo.id}`,
    name,
    width,
    height,
    tiles,
    portals: [],
    entities: { list: [] },
    spatialHash: null,
  }

  // Portal from interior exit door back to overworld (one tile south of the building door)
  world.portals.push({
    x: exitX,
    y: exitY,
    targetWorldId: 'overworld',
    targetX: buildingInfo.doorX,
    targetY: buildingInfo.doorY + 1,
  })

  // Portal from overworld door into interior entrance
  worldManager.addPortal(
    'overworld',
    buildingInfo.doorX, buildingInfo.doorY,
    world.id,
    exitX, exitY - 1,
  )

  return world
}

function makeBox(tiles, w, h, W, wallTile, floorTile) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const edge = x === 0 || x === w - 1 || y === 0 || y === h - 1
      if (edge) {
        let t = wallTile || TILE.BOX_H
        if (x === 0 && y === 0) t = TILE.BOX_NW
        else if (x === w - 1 && y === 0) t = TILE.BOX_NE
        else if (x === 0 && y === h - 1) t = TILE.BOX_SW
        else if (x === w - 1 && y === h - 1) t = TILE.BOX_SE
        else if (y === 0 || y === h - 1) t = TILE.BOX_H
        else t = TILE.BOX_V
        tiles[y * W + x] = t
      } else {
        tiles[y * W + x] = floorTile || TILE.FLOOR
      }
    }
  }
}

const TEMPLATES = {
  house(info) {
    const w = 10
    const h = 8
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    // Furniture
    tiles[2 * W + 2] = TILE.BED
    tiles[2 * W + 3] = TILE.BED
    tiles[2 * W + 7] = TILE.TABLE
    tiles[3 * W + 7] = TILE.CHAIR
    tiles[4 * W + 2] = TILE.BARREL
    tiles[5 * W + 6] = TILE.BOOKSHELF

    // Exit door at bottom center
    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'House' }
  },

  shop(info) {
    const w = 12
    const h = 10
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    // Counter runs across middle
    for (let x = 2; x <= 9; x++) tiles[4 * W + x] = TILE.COUNTER
    // Shelves on back wall
    for (let x = 2; x <= 9; x++) tiles[1 * W + x] = TILE.BOOKSHELF
    tiles[6 * W + 2] = TILE.BARREL
    tiles[6 * W + 3] = TILE.BARREL
    tiles[7 * W + 9] = TILE.CHAIR

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Shop' }
  },

  tavern(info) {
    const w = 16
    const h = 12
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    // Bar counter along left
    for (let y = 2; y <= 6; y++) tiles[y * W + 2] = TILE.COUNTER
    // Tables and chairs
    const tableSpots = [[5, 3], [5, 6], [8, 3], [8, 6], [11, 3], [11, 6]]
    for (const [tx, ty] of tableSpots) {
      tiles[ty * W + tx] = TILE.TABLE
      if (tx + 1 < w - 1) tiles[ty * W + tx + 1] = TILE.CHAIR
      if (ty + 1 < h - 1) tiles[(ty + 1) * W + tx] = TILE.CHAIR
    }
    // Barrels behind counter
    tiles[2 * W + 1] = TILE.BARREL
    tiles[3 * W + 1] = TILE.BARREL

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Tavern' }
  },

  blacksmith(info) {
    const w = 12
    const h = 10
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    tiles[2 * W + 2] = TILE.FORGE
    tiles[2 * W + 3] = TILE.FORGE
    tiles[3 * W + 2] = TILE.FORGE
    tiles[2 * W + 8] = TILE.BARREL
    tiles[2 * W + 9] = TILE.BARREL
    tiles[3 * W + 9] = TILE.BARREL
    tiles[5 * W + 5] = TILE.TABLE
    tiles[5 * W + 6] = TILE.CHAIR

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Blacksmith' }
  },

  temple(info) {
    const w = 14
    const h = 16
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    // Carpet runner down center
    for (let y = 2; y <= 12; y++) {
      tiles[y * W + 6] = TILE.CARPET
      tiles[y * W + 7] = TILE.CARPET
    }
    // Altar at the back
    tiles[2 * W + 6] = TILE.ALTAR
    tiles[2 * W + 7] = TILE.ALTAR
    // Columns
    for (let y = 4; y <= 10; y += 3) {
      tiles[y * W + 3] = TILE.COLUMN
      tiles[y * W + 10] = TILE.COLUMN
    }

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Temple' }
  },

  barracks(info) {
    const w = 14
    const h = 10
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    // Bunks along walls
    for (let y = 2; y <= 6; y += 2) {
      tiles[y * W + 2] = TILE.BED
      tiles[y * W + 3] = TILE.BED
      tiles[y * W + 10] = TILE.BED
      tiles[y * W + 11] = TILE.BED
    }
    tiles[2 * W + 6] = TILE.BARREL
    tiles[2 * W + 7] = TILE.BARREL
    tiles[7 * W + 6] = TILE.TABLE
    tiles[7 * W + 7] = TILE.CHAIR

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Barracks' }
  },

  noble_house(info) {
    const w = 16
    const h = 14
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.BOX_H, TILE.FLOOR)

    // Carpet in main room
    for (let y = 2; y <= 5; y++) {
      for (let x = 2; x <= 13; x++) {
        tiles[y * W + x] = TILE.CARPET
      }
    }
    // Room divider
    for (let x = 1; x <= 14; x++) {
      if (x === 7 || x === 8) continue
      tiles[7 * W + x] = TILE.BOX_H
    }
    tiles[7 * W + 7] = TILE.DOOR_INTERIOR
    tiles[7 * W + 8] = TILE.DOOR_INTERIOR

    // Bedroom
    tiles[9 * W + 3] = TILE.BED
    tiles[9 * W + 4] = TILE.BED
    tiles[10 * W + 3] = TILE.BED
    tiles[9 * W + 11] = TILE.BOOKSHELF
    tiles[9 * W + 12] = TILE.BOOKSHELF

    // Study
    tiles[3 * W + 12] = TILE.TABLE
    tiles[4 * W + 12] = TILE.CHAIR
    tiles[3 * W + 3] = TILE.BOOKSHELF
    tiles[3 * W + 4] = TILE.BOOKSHELF

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Noble House' }
  },

  castle_throne(info) {
    const w = 20
    const h = 16
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.CASTLE_WALL, TILE.FLOOR)

    // Carpet runner
    for (let y = 2; y <= 13; y++) {
      tiles[y * W + 9] = TILE.CARPET
      tiles[y * W + 10] = TILE.CARPET
    }
    // Throne
    tiles[2 * W + 9] = TILE.THRONE
    tiles[2 * W + 10] = TILE.THRONE
    // Columns along sides
    for (let y = 3; y <= 11; y += 4) {
      tiles[y * W + 4] = TILE.COLUMN
      tiles[y * W + 15] = TILE.COLUMN
    }

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Throne Room' }
  },

  castle_chamber(info) {
    const w = 10
    const h = 10
    const W = w
    const tiles = new Uint16Array(w * h)
    makeBox(tiles, w, h, W, TILE.CASTLE_WALL, TILE.CARPET)

    tiles[2 * W + 2] = TILE.BED
    tiles[2 * W + 3] = TILE.BED
    tiles[3 * W + 2] = TILE.BED
    tiles[2 * W + 7] = TILE.TABLE
    tiles[3 * W + 7] = TILE.CHAIR
    tiles[5 * W + 7] = TILE.BOOKSHELF
    tiles[6 * W + 7] = TILE.BOOKSHELF

    const exitX = (w >> 1)
    const exitY = h - 1
    tiles[exitY * W + exitX] = TILE.DOOR

    return { width: w, height: h, tiles, exitX, exitY, name: 'Castle Chamber' }
  },

  dungeon(info) {
    const w = 40
    const h = 40
    const W = w
    const tiles = new Uint16Array(w * h)

    // Fill with dungeon wall
    tiles.fill(TILE.DUNGEON_WALL)

    // Carve rooms and corridors with a simple BSP-like approach
    const rooms = []
    function carveRoom(rx, ry, rw, rh) {
      for (let y = ry; y < ry + rh && y < h; y++) {
        for (let x = rx; x < rx + rw && x < w; x++) {
          tiles[y * W + x] = TILE.DUNGEON_FLOOR
        }
      }
      rooms.push({ x: rx, y: ry, w: rw, h: rh })
    }

    // Entrance room
    carveRoom(17, 35, 6, 4)

    // Random rooms
    const seed = info.doorX * 1000 + info.doorY
    let s = seed
    function r() {
      s = (s * 1103515245 + 12345) & 0x7fffffff
      return (s >>> 16) / 32768
    }
    for (let i = 0; i < 12; i++) {
      const rx = 2 + ((r() * (w - 10)) | 0)
      const ry = 2 + ((r() * (h - 10)) | 0)
      const rw = 4 + ((r() * 6) | 0)
      const rh = 4 + ((r() * 6) | 0)
      carveRoom(rx, ry, rw, rh)
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1]
      const b = rooms[i]
      const ax = a.x + (a.w >> 1)
      const ay = a.y + (a.h >> 1)
      const bx = b.x + (b.w >> 1)
      const by = b.y + (b.h >> 1)

      let cx = ax
      let cy = ay
      while (cx !== bx) {
        if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
          tiles[cy * W + cx] = TILE.DUNGEON_FLOOR
        }
        cx += cx < bx ? 1 : -1
      }
      while (cy !== by) {
        if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
          tiles[cy * W + cx] = TILE.DUNGEON_FLOOR
        }
        cy += cy < by ? 1 : -1
      }
    }

    // Cell bars in a few rooms
    for (let i = 2; i < rooms.length && i < 5; i++) {
      const rm = rooms[i]
      tiles[rm.y * W + rm.x] = TILE.CELL_BARS
      tiles[rm.y * W + rm.x + rm.w - 1] = TILE.CELL_BARS
    }

    // Exit stair at entrance room
    const exitX = 20
    const exitY = 38
    tiles[exitY * W + exitX] = TILE.STAIR_UP

    return { width: w, height: h, tiles, exitX, exitY, name: 'Dungeon' }
  },
}

/**
 * Generate all interior worlds for every building in the registry.
 */
export function generateAllInteriors(buildingRegistry, worldManager) {
  const interiors = []
  for (const info of buildingRegistry) {
    const interior = createInterior(info, worldManager)
    interiors.push(interior)
  }
  return interiors
}
