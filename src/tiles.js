/** Tile catalog: index -> { char, fg, bg, solid } */

export const TILE_DEFS = [
  // 0-28: Original tiles
  { char: '·', fg: '#4a7c3f', bg: '#1a2e15', solid: false }, // GRASS
  { char: '♠', fg: '#2d5a1e', bg: '#1a2e15', solid: false }, // DENSE_FOREST
  { char: '~', fg: '#4a8fe7', bg: '#0f2a4a', solid: true },  // WATER
  { char: '░', fg: '#c4a44e', bg: '#3a2e15', solid: false }, // PATH
  { char: '▲', fg: '#8a8a8a', bg: '#2a2a2a', solid: true },  // MOUNTAIN
  { char: '✿', fg: '#e8c040', bg: '#1a2e15', solid: false }, // FLOWER
  { char: '█', fg: '#8B7355', bg: '#5a4a3a', solid: true },  // WALL
  { char: '▒', fg: '#c4944e', bg: '#3a2e15', solid: false }, // DOOR
  { char: '═', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_H
  { char: '║', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_V
  { char: '╔', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_NW
  { char: '╗', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_NE
  { char: '╚', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_SW
  { char: '╝', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_SE
  { char: '╠', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_L
  { char: '╣', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_R
  { char: '╦', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_T
  { char: '╩', fg: '#a08060', bg: '#2a2218', solid: true },  // BOX_B
  { char: ' ', fg: '#c4b090', bg: '#2a2218', solid: false }, // FLOOR
  { char: ':', fg: '#4a7c3f', bg: '#1a2e15', solid: false }, // GRASS_B
  { char: ',', fg: '#4a7c3f', bg: '#1a2e15', solid: false }, // GRASS_C
  { char: '♣', fg: '#2d5a1e', bg: '#1a2e15', solid: false }, // TREE_B
  { char: '♧', fg: '#2d5a1e', bg: '#1a2e15', solid: false }, // TREE_C
  { char: '≈', fg: '#4a8fe7', bg: '#0f2a4a', solid: true },  // WATER_B
  { char: '∿', fg: '#4a8fe7', bg: '#0f2a4a', solid: true },  // WATER_C
  { char: '▒', fg: '#c4a44e', bg: '#3a2e15', solid: false }, // PATH_B
  { char: '△', fg: '#8a8a8a', bg: '#2a2a2a', solid: true },  // MOUNTAIN_B
  { char: '▴', fg: '#8a8a8a', bg: '#2a2a2a', solid: true },  // MOUNTAIN_C
  { char: '❀', fg: '#eab308', bg: '#1a2e15', solid: false }, // FLOWER_B

  // 29+: New medieval city tiles
  { char: '▓', fg: '#8a8080', bg: '#4a4444', solid: false }, // COBBLE
  { char: '░', fg: '#7a7070', bg: '#4a4444', solid: false }, // COBBLE_B
  { char: '█', fg: '#6a6a70', bg: '#3a3a42', solid: true },  // CASTLE_WALL
  { char: '∩', fg: '#9a9a9a', bg: '#4a4444', solid: false }, // GATE
  { char: '>', fg: '#e0c070', bg: '#2a2218', solid: false }, // STAIR_DOWN
  { char: '<', fg: '#e0c070', bg: '#2a2218', solid: false }, // STAIR_UP
  { char: '▓', fg: '#5a5060', bg: '#1a1820', solid: false }, // DUNGEON_FLOOR
  { char: '█', fg: '#4a4050', bg: '#1a1820', solid: true },  // DUNGEON_WALL
  { char: '╤', fg: '#8a6a40', bg: '#2a2218', solid: true },  // TABLE
  { char: 'h', fg: '#8a6a40', bg: '#2a2218', solid: true },  // CHAIR
  { char: '=', fg: '#6a5030', bg: '#2a2218', solid: true },  // BED
  { char: 'o', fg: '#7a5a30', bg: '#2a2218', solid: true },  // BARREL
  { char: '|', fg: '#6a5a40', bg: '#2a2218', solid: true },  // BOOKSHELF
  { char: '~', fg: '#8a2020', bg: '#3a1818', solid: false }, // CARPET
  { char: '+', fg: '#c4944e', bg: '#2a2218', solid: false }, // DOOR_INTERIOR
  { char: '≡', fg: '#a08060', bg: '#2a2218', solid: true },  // COUNTER
  { char: '¥', fg: '#d06020', bg: '#2a2218', solid: true },  // FORGE
  { char: '†', fg: '#c0c0d0', bg: '#2a2218', solid: true },  // ALTAR
  { char: '■', fg: '#707080', bg: '#1a1820', solid: true },  // CELL_BARS
  { char: 'π', fg: '#a08060', bg: '#2a2218', solid: true },  // THRONE
  { char: '|', fg: '#808080', bg: '#2a2218', solid: true },  // COLUMN
  { char: '♦', fg: '#c0b070', bg: '#1a2e15', solid: false }, // MARKET_STALL

  // 51+: Biome tiles - Desert
  { char: '·', fg: '#e0c878', bg: '#c4a44e', solid: false }, // SAND
  { char: ':', fg: '#d4b860', bg: '#c4a44e', solid: false }, // SAND_B
  { char: '∿', fg: '#d4b050', bg: '#b89840', solid: false }, // DUNE
  { char: '¥', fg: '#5a8a30', bg: '#c4a44e', solid: true },  // CACTUS
  { char: ',', fg: '#8a7a40', bg: '#c4a44e', solid: false }, // DRY_BUSH
  { char: '░', fg: '#d0b060', bg: '#b89840', solid: false }, // DESERT_PATH

  // 57+: Snow / Tundra
  { char: '·', fg: '#e8e8f0', bg: '#c8c8d8', solid: false }, // SNOW
  { char: ':', fg: '#d8d8e8', bg: '#c8c8d8', solid: false }, // SNOW_B
  { char: '~', fg: '#a0c0e8', bg: '#80a0c8', solid: true },  // ICE
  { char: '♠', fg: '#607868', bg: '#c8c8d8', solid: true },  // FROZEN_TREE
  { char: ',', fg: '#889890', bg: '#a0a8a0', solid: false }, // TUNDRA_GRASS
  { char: '♣', fg: '#506858', bg: '#c8c8d8', solid: true },  // FROZEN_TREE_B

  // 63+: Jungle
  { char: '♠', fg: '#1a6a10', bg: '#0a3a08', solid: true },  // JUNGLE_TREE
  { char: '♣', fg: '#1a7a10', bg: '#0a3a08', solid: true },  // JUNGLE_TREE_B
  { char: '|', fg: '#2a8a20', bg: '#0a3a08', solid: false }, // VINE
  { char: '✿', fg: '#e840a0', bg: '#0a3a08', solid: false }, // TROPICAL_FLOWER
  { char: '·', fg: '#308a28', bg: '#0a3a08', solid: false }, // JUNGLE_FLOOR

  // 68+: Swamp
  { char: '~', fg: '#5a7a40', bg: '#2a3a18', solid: false }, // SWAMP
  { char: '≈', fg: '#4a6a38', bg: '#2a3a18', solid: false }, // SWAMP_B
  { char: '♠', fg: '#4a4a30', bg: '#2a3a18', solid: true },  // DEAD_TREE
  { char: '▒', fg: '#6a5a30', bg: '#3a2e18', solid: false }, // MUD
  { char: '≈', fg: '#5a6a40', bg: '#2a3a18', solid: true },  // MARSH

  // 73+: Beach
  { char: '·', fg: '#e8d890', bg: '#d4c478', solid: false }, // BEACH_SAND
  { char: '♣', fg: '#40a830', bg: '#d4c478', solid: true },  // PALM_TREE

  // 75+: Taiga
  { char: '♠', fg: '#2a5a30', bg: '#a8b0a8', solid: true },  // TAIGA_TREE
  { char: '♣', fg: '#2a6838', bg: '#a8b0a8', solid: true },  // TAIGA_TREE_B
  { char: '·', fg: '#889888', bg: '#a8b0a8', solid: false }, // TAIGA_FLOOR

  // 78+: Cave / structure entrances
  { char: 'O', fg: '#3a3a3a', bg: '#1a1a1a', solid: false }, // CAVE_ENTRANCE

  // 79+: Plains
  { char: '"', fg: '#7a9a50', bg: '#1a2e15', solid: false }, // TALL_GRASS
  { char: '❀', fg: '#c86090', bg: '#1a2e15', solid: false }, // WILD_FLOWER
  { char: '°', fg: '#8a8a7a', bg: '#1a2e15', solid: false }, // ROCK
]

export const TILE = {
  GRASS: 0,
  DENSE_FOREST: 1,
  WATER: 2,
  PATH: 3,
  MOUNTAIN: 4,
  FLOWER: 5,
  WALL: 6,
  DOOR: 7,
  BOX_H: 8,
  BOX_V: 9,
  BOX_NW: 10,
  BOX_NE: 11,
  BOX_SW: 12,
  BOX_SE: 13,
  BOX_L: 14,
  BOX_R: 15,
  BOX_T: 16,
  BOX_B: 17,
  FLOOR: 18,
  GRASS_B: 19,
  GRASS_C: 20,
  TREE_B: 21,
  TREE_C: 22,
  WATER_B: 23,
  WATER_C: 24,
  PATH_B: 25,
  MOUNTAIN_B: 26,
  MOUNTAIN_C: 27,
  FLOWER_B: 28,

  COBBLE: 29,
  COBBLE_B: 30,
  CASTLE_WALL: 31,
  GATE: 32,
  STAIR_DOWN: 33,
  STAIR_UP: 34,
  DUNGEON_FLOOR: 35,
  DUNGEON_WALL: 36,
  TABLE: 37,
  CHAIR: 38,
  BED: 39,
  BARREL: 40,
  BOOKSHELF: 41,
  CARPET: 42,
  DOOR_INTERIOR: 43,
  COUNTER: 44,
  FORGE: 45,
  ALTAR: 46,
  CELL_BARS: 47,
  THRONE: 48,
  COLUMN: 49,
  MARKET_STALL: 50,

  // Desert
  SAND: 51,
  SAND_B: 52,
  DUNE: 53,
  CACTUS: 54,
  DRY_BUSH: 55,
  DESERT_PATH: 56,

  // Snow / Tundra
  SNOW: 57,
  SNOW_B: 58,
  ICE: 59,
  FROZEN_TREE: 60,
  TUNDRA_GRASS: 61,
  FROZEN_TREE_B: 62,

  // Jungle
  JUNGLE_TREE: 63,
  JUNGLE_TREE_B: 64,
  VINE: 65,
  TROPICAL_FLOWER: 66,
  JUNGLE_FLOOR: 67,

  // Swamp
  SWAMP: 68,
  SWAMP_B: 69,
  DEAD_TREE: 70,
  MUD: 71,
  MARSH: 72,

  // Beach
  BEACH_SAND: 73,
  PALM_TREE: 74,

  // Taiga
  TAIGA_TREE: 75,
  TAIGA_TREE_B: 76,
  TAIGA_FLOOR: 77,

  // Cave entrance
  CAVE_ENTRANCE: 78,

  // Plains
  TALL_GRASS: 79,
  WILD_FLOWER: 80,
  ROCK: 81,
}

export function getTileDef(id) {
  return TILE_DEFS[id] ?? TILE_DEFS[TILE.GRASS]
}
