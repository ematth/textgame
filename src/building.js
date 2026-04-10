import { TILE, TILE_DEFS, WALL_GROUPS, getTileDef } from './tiles.js'
import { getTile, setTile } from './world.js'

let active = false
let selectedTileId = -1
let galleryScroll = 0

export function toggleBuildingMode() {
  active = !active
  if (!active) selectedTileId = -1
}

export function isBuildingMode() { return active }
export function getSelectedTile() { return selectedTileId }
export function setSelectedTile(id) { selectedTileId = id }
export function getGalleryScroll() { return galleryScroll }

export function scrollGallery(delta, maxScroll) {
  galleryScroll = Math.max(0, Math.min(maxScroll, galleryScroll + delta * 36))
}

// Bitmask order: N=1, E=2, S=4, W=8
// Wall set offsets from base: 0=pillar, 1=H, 2=V, 3=NW, 4=NE, 5=SW, 6=SE, 7=TD, 8=TU, 9=TR, 10=TL, 11=X
const BITMASK_TO_OFFSET = [
  0,  // 0000 isolated -> pillar
  2,  // 0001 N -> V
  1,  // 0010 E -> H
  5,  // 0011 N+E -> SW corner (wall goes south-west from this point)
  2,  // 0100 S -> V
  2,  // 0101 N+S -> V
  3,  // 0110 S+E -> NW corner
  9,  // 0111 N+S+E -> T-right
  1,  // 1000 W -> H
  6,  // 1001 N+W -> SE corner
  1,  // 1010 E+W -> H
  7,  // 1011 N+E+W -> T-down
  4,  // 1100 S+W -> NE corner
  10, // 1101 N+S+W -> T-left
  8,  // 1110 S+E+W -> T-up
  11, // 1111 all -> cross
]

function getWallGroup(tileId) {
  const td = TILE_DEFS[tileId]
  return td ? td.wallGroup : undefined
}

function getWallBaseId(wallGroup) {
  return WALL_GROUPS[wallGroup]
}

function updateWallConnections(world, x, y, cascade) {
  const tileId = getTile(world, x, y)
  const wg = getWallGroup(tileId)
  if (!wg) return

  const baseId = getWallBaseId(wg)
  if (baseId === undefined) return

  // Build bitmask from cardinal neighbors
  let mask = 0
  if (getWallGroup(getTile(world, x, y - 1)) === wg) mask |= 1 // N
  if (getWallGroup(getTile(world, x + 1, y)) === wg) mask |= 2 // E
  if (getWallGroup(getTile(world, x, y + 1)) === wg) mask |= 4 // S
  if (getWallGroup(getTile(world, x - 1, y)) === wg) mask |= 8 // W

  const newTileId = baseId + BITMASK_TO_OFFSET[mask]
  if (newTileId !== tileId) {
    setTile(world, x, y, newTileId)
  }

  // Cascade to neighbors (one level only)
  if (cascade) {
    updateWallConnections(world, x, y - 1, false)
    updateWallConnections(world, x + 1, y, false)
    updateWallConnections(world, x, y + 1, false)
    updateWallConnections(world, x - 1, y, false)
  }
}

export function placeTile(world, x, y) {
  if (selectedTileId < 0) return
  setTile(world, x, y, selectedTileId)
  // If placed tile is a wall, update connections
  updateWallConnections(world, x, y, true)
}

export function destroyTile(world, x, y) {
  // Get the current tile's background color to find a matching floor
  const currentId = getTile(world, x, y)
  const currentDef = getTileDef(currentId)
  // Set to basic floor tile — keeps bg feel of the area
  setTile(world, x, y, TILE.FLOOR)
  // Update any wall neighbors that may have connected to this tile
  const wg = getWallGroup(currentId)
  if (wg) {
    updateWallConnections(world, x, y - 1, false)
    updateWallConnections(world, x + 1, y, false)
    updateWallConnections(world, x, y + 1, false)
    updateWallConnections(world, x - 1, y, false)
  }
}

// Tile categories for gallery display
export const TILE_CATEGORIES = [
  {
    name: 'Walls',
    tiles: [
      TILE.STONE_PILLAR, TILE.WOOD_PILLAR, TILE.BRICK_PILLAR,
      TILE.WALL, TILE.CASTLE_WALL, TILE.DUNGEON_WALL, TILE.WHITE_WALL,
      TILE.LOG_CABIN_WALL,
    ],
  },
  {
    name: 'Floors',
    tiles: [
      TILE.FLOOR, TILE.STONE_FLOOR, TILE.WOOD_PLANK, TILE.TILE_FLOOR,
      TILE.MARBLE_FLOOR, TILE.DARK_WOOD_FLOOR, TILE.PARQUET_FLOOR,
      TILE.DARK_FLOOR, TILE.DUNGEON_FLOOR, TILE.COBBLE, TILE.COBBLE_B,
    ],
  },
  {
    name: 'Rugs & Carpet',
    tiles: [
      TILE.CARPET, TILE.RED_RUG, TILE.BLUE_RUG, TILE.GREEN_RUG,
      TILE.ORNATE_CARPET, TILE.PURPLE_CARPET,
    ],
  },
  {
    name: 'Doors & Gates',
    tiles: [
      TILE.DOOR, TILE.DOOR_INTERIOR, TILE.WOOD_DOOR, TILE.IRON_DOOR,
      TILE.ARCHED_DOOR, TILE.GATE,
    ],
  },
  {
    name: 'Windows',
    tiles: [TILE.WINDOW, TILE.ROUND_WINDOW],
  },
  {
    name: 'Fences',
    tiles: [TILE.WOOD_FENCE, TILE.IRON_FENCE, TILE.FENCE_POST, TILE.CELL_BARS],
  },
  {
    name: 'Furniture',
    tiles: [
      TILE.TABLE, TILE.CHAIR, TILE.BED, TILE.BARREL, TILE.BOOKSHELF,
      TILE.COUNTER, TILE.THRONE, TILE.COLUMN, TILE.CRATE,
      TILE.POTTED_PLANT, TILE.WELL, TILE.ANVIL, TILE.FOUNTAIN,
    ],
  },
  {
    name: 'Lighting',
    tiles: [TILE.TORCH, TILE.LANTERN, TILE.CHANDELIER],
  },
  {
    name: 'Stairs & Ladders',
    tiles: [TILE.STAIR_DOWN, TILE.STAIR_UP, TILE.LADDER, TILE.CAVE_ENTRANCE],
  },
  {
    name: 'Logs & Timber',
    tiles: [TILE.LOG_H, TILE.LOG_V],
  },
  {
    name: 'Roofing',
    tiles: [TILE.THATCH_ROOF, TILE.WOOD_ROOF, TILE.SLATE_ROOF],
  },
  {
    name: 'Utility',
    tiles: [
      TILE.FORGE, TILE.ALTAR, TILE.IRON_GRATE, TILE.MARKET_STALL,
      TILE.STONE_CIRCLE, TILE.GRAVESTONE,
    ],
  },
  {
    name: 'Paths & Ground',
    tiles: [
      TILE.PATH, TILE.GRAVEL, TILE.GARDEN_TILE, TILE.SHALLOW_WATER,
      TILE.GRASS, TILE.SAND, TILE.SNOW, TILE.MUD,
    ],
  },
  {
    name: 'Nature',
    tiles: [
      TILE.DENSE_FOREST, TILE.TREE_B, TILE.FLOWER, TILE.WILD_FLOWER,
      TILE.TALL_GRASS, TILE.ROCK, TILE.WATER, TILE.PALM_TREE,
      TILE.CACTUS,
    ],
  },
]
