/** Tile catalog: index -> { char, fg, bg, solid } */

export const TILE_DEFS = [
  { char: '·', fg: '#4a7c3f', bg: '#1a2e15', solid: false }, // GRASS
  { char: '♠', fg: '#2d5a1e', bg: '#1a2e15', solid: false }, // DENSE_FOREST
  { char: '~', fg: '#4a8fe7', bg: '#0f2a4a', solid: true }, // WATER
  { char: '░', fg: '#c4a44e', bg: '#3a2e15', solid: false }, // PATH
  { char: '▲', fg: '#8a8a8a', bg: '#2a2a2a', solid: true }, // MOUNTAIN
  { char: '✿', fg: '#e8c040', bg: '#1a2e15', solid: false }, // FLOWER (magenta/yellow -> warm yellow)
  { char: '█', fg: '#8B7355', bg: '#5a4a3a', solid: true }, // WALL
  { char: '▒', fg: '#c4944e', bg: '#3a2e15', solid: false }, // DOOR
  // Box drawing for buildings
  { char: '═', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '║', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╔', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╗', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╚', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╝', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╠', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╣', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╦', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: '╩', fg: '#a08060', bg: '#2a2218', solid: true },
  { char: ' ', fg: '#c4b090', bg: '#2a2218', solid: false }, // FLOOR inside building
  { char: ':', fg: '#4a7c3f', bg: '#1a2e15', solid: false }, // GRASS_B
  { char: ',', fg: '#4a7c3f', bg: '#1a2e15', solid: false }, // GRASS_C
  { char: '♣', fg: '#2d5a1e', bg: '#1a2e15', solid: false }, // TREE_B
  { char: '♧', fg: '#2d5a1e', bg: '#1a2e15', solid: false }, // TREE_C
  { char: '≈', fg: '#4a8fe7', bg: '#0f2a4a', solid: true }, // WATER_B
  { char: '∿', fg: '#4a8fe7', bg: '#0f2a4a', solid: true }, // WATER_C
  { char: '▒', fg: '#c4a44e', bg: '#3a2e15', solid: false }, // PATH_B
  { char: '△', fg: '#8a8a8a', bg: '#2a2a2a', solid: true }, // MOUNTAIN_B
  { char: '▴', fg: '#8a8a8a', bg: '#2a2a2a', solid: true }, // MOUNTAIN_C
  { char: '❀', fg: '#eab308', bg: '#1a2e15', solid: false }, // FLOWER_B
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
}

export function getTileDef(id) {
  return TILE_DEFS[id] ?? TILE_DEFS[TILE.GRASS]
}
