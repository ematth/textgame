/** Tile catalog: index -> { char, fg, bg, solid, name, wallGroup? } */

export const TILE_DEFS = [
  // 0-28: Original tiles
  { char: '·', fg: '#4a7c3f', bg: '#1a2e15', solid: false, name: 'Grass' },             // 0
  { char: '♠', fg: '#2d5a1e', bg: '#1a2e15', solid: false, name: 'Dense Forest' },       // 1
  { char: '~', fg: '#4a8fe7', bg: '#0f2a4a', solid: true, name: 'Water' },               // 2
  { char: '░', fg: '#c4a44e', bg: '#3a2e15', solid: false, name: 'Path' },               // 3
  { char: '▲', fg: '#8a8a8a', bg: '#2a2a2a', solid: true, name: 'Mountain' },            // 4
  { char: '✿', fg: '#e8c040', bg: '#1a2e15', solid: false, name: 'Flower' },             // 5
  { char: '█', fg: '#8B7355', bg: '#5a4a3a', solid: true, name: 'Wall' },                // 6
  { char: '▒', fg: '#c4944e', bg: '#3a2e15', solid: false, name: 'Door' },               // 7
  { char: '═', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box H' },               // 8
  { char: '║', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box V' },               // 9
  { char: '╔', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box NW' },              // 10
  { char: '╗', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box NE' },              // 11
  { char: '╚', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box SW' },              // 12
  { char: '╝', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box SE' },              // 13
  { char: '╠', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box L' },               // 14
  { char: '╣', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box R' },               // 15
  { char: '╦', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box T' },               // 16
  { char: '╩', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Box B' },               // 17
  { char: ' ', fg: '#c4b090', bg: '#2a2218', solid: false, name: 'Floor' },              // 18
  { char: ':', fg: '#4a7c3f', bg: '#1a2e15', solid: false, name: 'Grass B' },            // 19
  { char: ',', fg: '#4a7c3f', bg: '#1a2e15', solid: false, name: 'Grass C' },            // 20
  { char: '♣', fg: '#2d5a1e', bg: '#1a2e15', solid: false, name: 'Tree B' },             // 21
  { char: '♧', fg: '#2d5a1e', bg: '#1a2e15', solid: false, name: 'Tree C' },             // 22
  { char: '≈', fg: '#4a8fe7', bg: '#0f2a4a', solid: true, name: 'Water B' },             // 23
  { char: '∿', fg: '#4a8fe7', bg: '#0f2a4a', solid: true, name: 'Water C' },             // 24
  { char: '▒', fg: '#c4a44e', bg: '#3a2e15', solid: false, name: 'Path B' },             // 25
  { char: '△', fg: '#8a8a8a', bg: '#2a2a2a', solid: true, name: 'Mountain B' },          // 26
  { char: '▴', fg: '#8a8a8a', bg: '#2a2a2a', solid: true, name: 'Mountain C' },          // 27
  { char: '❀', fg: '#eab308', bg: '#1a2e15', solid: false, name: 'Flower B' },           // 28

  // 29-50: Medieval city tiles
  { char: '▓', fg: '#8a8080', bg: '#4a4444', solid: false, name: 'Cobblestone' },        // 29
  { char: '░', fg: '#7a7070', bg: '#4a4444', solid: false, name: 'Cobblestone B' },      // 30
  { char: '█', fg: '#6a6a70', bg: '#3a3a42', solid: true, name: 'Castle Wall' },         // 31
  { char: '∩', fg: '#9a9a9a', bg: '#4a4444', solid: false, name: 'Gate' },               // 32
  { char: '>', fg: '#e0c070', bg: '#2a2218', solid: false, name: 'Stairs Down' },        // 33
  { char: '<', fg: '#e0c070', bg: '#2a2218', solid: false, name: 'Stairs Up' },          // 34
  { char: '▓', fg: '#5a5060', bg: '#1a1820', solid: false, name: 'Dungeon Floor' },     // 35
  { char: '█', fg: '#4a4050', bg: '#1a1820', solid: true, name: 'Dungeon Wall' },       // 36
  { char: '╤', fg: '#8a6a40', bg: '#2a2218', solid: true, name: 'Table' },              // 37
  { char: 'h', fg: '#8a6a40', bg: '#2a2218', solid: true, name: 'Chair' },              // 38
  { char: '=', fg: '#6a5030', bg: '#2a2218', solid: true, name: 'Bed' },                // 39
  { char: 'o', fg: '#7a5a30', bg: '#2a2218', solid: true, name: 'Barrel' },             // 40
  { char: '|', fg: '#6a5a40', bg: '#2a2218', solid: true, name: 'Bookshelf' },          // 41
  { char: '~', fg: '#8a2020', bg: '#3a1818', solid: false, name: 'Carpet' },            // 42
  { char: '+', fg: '#c4944e', bg: '#2a2218', solid: false, name: 'Interior Door' },     // 43
  { char: '≡', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Counter' },            // 44
  { char: '¥', fg: '#d06020', bg: '#2a2218', solid: true, name: 'Forge' },              // 45
  { char: '†', fg: '#c0c0d0', bg: '#2a2218', solid: true, name: 'Altar' },              // 46
  { char: '■', fg: '#707080', bg: '#1a1820', solid: true, name: 'Cell Bars' },          // 47
  { char: 'π', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Throne' },             // 48
  { char: '|', fg: '#808080', bg: '#2a2218', solid: true, name: 'Column' },             // 49
  { char: '♦', fg: '#c0b070', bg: '#1a2e15', solid: false, name: 'Market Stall' },      // 50

  // 51-56: Desert
  { char: '·', fg: '#e0c878', bg: '#c4a44e', solid: false, name: 'Sand' },              // 51
  { char: ':', fg: '#d4b860', bg: '#c4a44e', solid: false, name: 'Sand B' },            // 52
  { char: '∿', fg: '#d4b050', bg: '#b89840', solid: false, name: 'Dune' },              // 53
  { char: '¥', fg: '#5a8a30', bg: '#c4a44e', solid: true, name: 'Cactus' },             // 54
  { char: ',', fg: '#8a7a40', bg: '#c4a44e', solid: false, name: 'Dry Bush' },          // 55
  { char: '░', fg: '#d0b060', bg: '#b89840', solid: false, name: 'Desert Path' },       // 56

  // 57-62: Snow / Tundra
  { char: '·', fg: '#e8e8f0', bg: '#c8c8d8', solid: false, name: 'Snow' },              // 57
  { char: ':', fg: '#d8d8e8', bg: '#c8c8d8', solid: false, name: 'Snow B' },            // 58
  { char: '~', fg: '#a0c0e8', bg: '#80a0c8', solid: true, name: 'Ice' },                // 59
  { char: '♠', fg: '#607868', bg: '#c8c8d8', solid: true, name: 'Frozen Tree' },        // 60
  { char: ',', fg: '#889890', bg: '#a0a8a0', solid: false, name: 'Tundra Grass' },      // 61
  { char: '♣', fg: '#506858', bg: '#c8c8d8', solid: true, name: 'Frozen Tree B' },      // 62

  // 63-67: Jungle
  { char: '♠', fg: '#1a6a10', bg: '#0a3a08', solid: true, name: 'Jungle Tree' },        // 63
  { char: '♣', fg: '#1a7a10', bg: '#0a3a08', solid: true, name: 'Jungle Tree B' },      // 64
  { char: '|', fg: '#2a8a20', bg: '#0a3a08', solid: false, name: 'Vine' },              // 65
  { char: '✿', fg: '#e840a0', bg: '#0a3a08', solid: false, name: 'Tropical Flower' },   // 66
  { char: '·', fg: '#308a28', bg: '#0a3a08', solid: false, name: 'Jungle Floor' },      // 67

  // 68-72: Swamp
  { char: '~', fg: '#5a7a40', bg: '#2a3a18', solid: false, name: 'Swamp' },             // 68
  { char: '≈', fg: '#4a6a38', bg: '#2a3a18', solid: false, name: 'Swamp B' },           // 69
  { char: '♠', fg: '#4a4a30', bg: '#2a3a18', solid: true, name: 'Dead Tree' },          // 70
  { char: '▒', fg: '#6a5a30', bg: '#3a2e18', solid: false, name: 'Mud' },               // 71
  { char: '≈', fg: '#5a6a40', bg: '#2a3a18', solid: true, name: 'Marsh' },              // 72

  // 73-74: Beach
  { char: '·', fg: '#e8d890', bg: '#d4c478', solid: false, name: 'Beach Sand' },        // 73
  { char: '♣', fg: '#40a830', bg: '#d4c478', solid: true, name: 'Palm Tree' },          // 74

  // 75-77: Taiga
  { char: '♠', fg: '#2a5a30', bg: '#a8b0a8', solid: true, name: 'Taiga Tree' },         // 75
  { char: '♣', fg: '#2a6838', bg: '#a8b0a8', solid: true, name: 'Taiga Tree B' },       // 76
  { char: '·', fg: '#889888', bg: '#a8b0a8', solid: false, name: 'Taiga Floor' },       // 77

  // 78: Cave entrance
  { char: 'O', fg: '#3a3a3a', bg: '#1a1a1a', solid: false, name: 'Cave Entrance' },     // 78

  // 79-81: Plains
  { char: '"', fg: '#7a9a50', bg: '#1a2e15', solid: false, name: 'Tall Grass' },         // 79
  { char: '❀', fg: '#c86090', bg: '#1a2e15', solid: false, name: 'Wild Flower' },        // 80
  { char: '°', fg: '#8a8a7a', bg: '#1a2e15', solid: false, name: 'Rock' },               // 81

  // ===== BUILDING TILES (82+) =====

  // 82-93: Auto-connecting stone wall set
  { char: '■', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Pillar', wallGroup: 'stone' },    // 82
  { char: '─', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall H', wallGroup: 'stone' },    // 83
  { char: '│', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall V', wallGroup: 'stone' },    // 84
  { char: '┌', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall NW', wallGroup: 'stone' },   // 85
  { char: '┐', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall NE', wallGroup: 'stone' },   // 86
  { char: '└', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall SW', wallGroup: 'stone' },   // 87
  { char: '┘', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall SE', wallGroup: 'stone' },   // 88
  { char: '┬', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall TD', wallGroup: 'stone' },   // 89
  { char: '┴', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall TU', wallGroup: 'stone' },   // 90
  { char: '├', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall TR', wallGroup: 'stone' },   // 91
  { char: '┤', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall TL', wallGroup: 'stone' },   // 92
  { char: '┼', fg: '#9a9a9a', bg: '#3a3a3a', solid: true, name: 'Stone Wall X', wallGroup: 'stone' },    // 93

  // 94-105: Auto-connecting wood wall set
  { char: '■', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Pillar', wallGroup: 'wood' },      // 94
  { char: '─', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall H', wallGroup: 'wood' },      // 95
  { char: '│', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall V', wallGroup: 'wood' },      // 96
  { char: '┌', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall NW', wallGroup: 'wood' },     // 97
  { char: '┐', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall NE', wallGroup: 'wood' },     // 98
  { char: '└', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall SW', wallGroup: 'wood' },     // 99
  { char: '┘', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall SE', wallGroup: 'wood' },     // 100
  { char: '┬', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall TD', wallGroup: 'wood' },     // 101
  { char: '┴', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall TU', wallGroup: 'wood' },     // 102
  { char: '├', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall TR', wallGroup: 'wood' },     // 103
  { char: '┤', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall TL', wallGroup: 'wood' },     // 104
  { char: '┼', fg: '#a08060', bg: '#2a2218', solid: true, name: 'Wood Wall X', wallGroup: 'wood' },      // 105

  // 106-117: Auto-connecting brick wall set
  { char: '■', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Pillar', wallGroup: 'brick' },    // 106
  { char: '─', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall H', wallGroup: 'brick' },    // 107
  { char: '│', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall V', wallGroup: 'brick' },    // 108
  { char: '┌', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall NW', wallGroup: 'brick' },   // 109
  { char: '┐', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall NE', wallGroup: 'brick' },   // 110
  { char: '└', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall SW', wallGroup: 'brick' },   // 111
  { char: '┘', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall SE', wallGroup: 'brick' },   // 112
  { char: '┬', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall TD', wallGroup: 'brick' },   // 113
  { char: '┴', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall TU', wallGroup: 'brick' },   // 114
  { char: '├', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall TR', wallGroup: 'brick' },   // 115
  { char: '┤', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall TL', wallGroup: 'brick' },   // 116
  { char: '┼', fg: '#b05a3a', bg: '#4a2218', solid: true, name: 'Brick Wall X', wallGroup: 'brick' },    // 117

  // 118+: Building materials - Floors
  { char: '·', fg: '#8a8a8a', bg: '#4a4a4a', solid: false, name: 'Stone Floor' },        // 118
  { char: '▬', fg: '#a08060', bg: '#3a2a18', solid: false, name: 'Wood Plank' },         // 119
  { char: '░', fg: '#c0b8a0', bg: '#8a8070', solid: false, name: 'Tile Floor' },         // 120
  { char: '·', fg: '#e0e0e8', bg: '#c0c0c8', solid: false, name: 'Marble Floor' },       // 121
  { char: '▓', fg: '#6a5a40', bg: '#3a2a18', solid: false, name: 'Dark Wood Floor' },    // 122
  { char: '░', fg: '#b0a090', bg: '#5a4a3a', solid: false, name: 'Parquet Floor' },      // 123

  // Rugs & Carpets
  { char: '~', fg: '#c03030', bg: '#6a1818', solid: false, name: 'Red Rug' },            // 124
  { char: '~', fg: '#3060c0', bg: '#182858', solid: false, name: 'Blue Rug' },           // 125
  { char: '≈', fg: '#c0a040', bg: '#5a3820', solid: false, name: 'Ornate Carpet' },      // 126
  { char: '~', fg: '#40a060', bg: '#184028', solid: false, name: 'Green Rug' },          // 127
  { char: '≈', fg: '#a050a0', bg: '#402040', solid: false, name: 'Purple Carpet' },      // 128

  // Logs & Timber
  { char: '=', fg: '#8a6a40', bg: '#1a2e15', solid: true, name: 'Log Horizontal' },      // 129
  { char: '|', fg: '#8a6a40', bg: '#1a2e15', solid: true, name: 'Log Vertical' },        // 130
  { char: '#', fg: '#7a5a30', bg: '#3a2a18', solid: false, name: 'Log Cabin Wall' },     // 131

  // Doors
  { char: '+', fg: '#a08060', bg: '#3a2a18', solid: false, name: 'Wood Door' },          // 132
  { char: '+', fg: '#707080', bg: '#2a2a30', solid: false, name: 'Iron Door' },          // 133
  { char: '∩', fg: '#c0a060', bg: '#3a2a18', solid: false, name: 'Arched Door' },        // 134

  // Windows & Openings
  { char: '□', fg: '#a0c8e8', bg: '#3a3a42', solid: true, name: 'Window' },              // 135
  { char: '○', fg: '#a0c8e8', bg: '#3a3a42', solid: true, name: 'Round Window' },        // 136

  // Fences & Barriers
  { char: '#', fg: '#8a7050', bg: '#1a2e15', solid: true, name: 'Wood Fence' },          // 137
  { char: '#', fg: '#707070', bg: '#1a2e15', solid: true, name: 'Iron Fence' },          // 138
  { char: ':', fg: '#8a7050', bg: '#1a2e15', solid: true, name: 'Fence Post' },          // 139

  // Furniture
  { char: 'H', fg: '#8a6a40', bg: '#2a2218', solid: false, name: 'Ladder' },             // 140
  { char: '†', fg: '#d08020', bg: '#2a2218', solid: false, name: 'Torch' },              // 141
  { char: '♦', fg: '#e0c040', bg: '#2a2218', solid: false, name: 'Chandelier' },         // 142
  { char: '≡', fg: '#5a5a5a', bg: '#2a2218', solid: true, name: 'Iron Grate' },          // 143
  { char: 'Ψ', fg: '#40a040', bg: '#1a2e15', solid: false, name: 'Potted Plant' },       // 144
  { char: '◊', fg: '#e0d0a0', bg: '#2a2218', solid: true, name: 'Crate' },               // 145
  { char: '∞', fg: '#4080c0', bg: '#2a2218', solid: true, name: 'Well' },                // 146
  { char: '¤', fg: '#c0c0d0', bg: '#2a2218', solid: true, name: 'Anvil' },               // 147
  { char: '☼', fg: '#e8c040', bg: '#2a2218', solid: false, name: 'Lantern' },            // 148
  { char: 'π', fg: '#c0c0d0', bg: '#4a4444', solid: true, name: 'Fountain' },            // 149

  // Decorative / Structural
  { char: '≡', fg: '#8a7050', bg: '#3a2a18', solid: true, name: 'Thatch Roof' },         // 150
  { char: '▲', fg: '#6a5a40', bg: '#3a2a18', solid: true, name: 'Wood Roof' },           // 151
  { char: '▓', fg: '#505058', bg: '#2a2a30', solid: true, name: 'Slate Roof' },          // 152
  { char: '·', fg: '#4a4a4a', bg: '#1a1a1a', solid: false, name: 'Dark Floor' },         // 153
  { char: '█', fg: '#e8e0d0', bg: '#c8c0b0', solid: true, name: 'White Wall' },          // 154
  { char: '░', fg: '#2a5a2a', bg: '#1a2e15', solid: false, name: 'Garden Tile' },        // 155
  { char: '▒', fg: '#c4a44e', bg: '#8a7a40', solid: false, name: 'Gravel' },             // 156
  { char: '≈', fg: '#4a8fe7', bg: '#2a5a8a', solid: false, name: 'Shallow Water' },      // 157
  { char: '○', fg: '#e0e0e0', bg: '#4a4444', solid: true, name: 'Stone Circle' },        // 158
  { char: '†', fg: '#808080', bg: '#1a2e15', solid: true, name: 'Gravestone' },           // 159
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

  // Building - Stone wall set
  STONE_PILLAR: 82,
  STONE_WALL_H: 83,
  STONE_WALL_V: 84,
  STONE_WALL_NW: 85,
  STONE_WALL_NE: 86,
  STONE_WALL_SW: 87,
  STONE_WALL_SE: 88,
  STONE_WALL_TD: 89,
  STONE_WALL_TU: 90,
  STONE_WALL_TR: 91,
  STONE_WALL_TL: 92,
  STONE_WALL_X: 93,

  // Building - Wood wall set
  WOOD_PILLAR: 94,
  WOOD_WALL_H: 95,
  WOOD_WALL_V: 96,
  WOOD_WALL_NW: 97,
  WOOD_WALL_NE: 98,
  WOOD_WALL_SW: 99,
  WOOD_WALL_SE: 100,
  WOOD_WALL_TD: 101,
  WOOD_WALL_TU: 102,
  WOOD_WALL_TR: 103,
  WOOD_WALL_TL: 104,
  WOOD_WALL_X: 105,

  // Building - Brick wall set
  BRICK_PILLAR: 106,
  BRICK_WALL_H: 107,
  BRICK_WALL_V: 108,
  BRICK_WALL_NW: 109,
  BRICK_WALL_NE: 110,
  BRICK_WALL_SW: 111,
  BRICK_WALL_SE: 112,
  BRICK_WALL_TD: 113,
  BRICK_WALL_TU: 114,
  BRICK_WALL_TR: 115,
  BRICK_WALL_TL: 116,
  BRICK_WALL_X: 117,

  // Building - Floors
  STONE_FLOOR: 118,
  WOOD_PLANK: 119,
  TILE_FLOOR: 120,
  MARBLE_FLOOR: 121,
  DARK_WOOD_FLOOR: 122,
  PARQUET_FLOOR: 123,

  // Rugs & Carpets
  RED_RUG: 124,
  BLUE_RUG: 125,
  ORNATE_CARPET: 126,
  GREEN_RUG: 127,
  PURPLE_CARPET: 128,

  // Logs
  LOG_H: 129,
  LOG_V: 130,
  LOG_CABIN_WALL: 131,

  // Doors
  WOOD_DOOR: 132,
  IRON_DOOR: 133,
  ARCHED_DOOR: 134,

  // Windows
  WINDOW: 135,
  ROUND_WINDOW: 136,

  // Fences
  WOOD_FENCE: 137,
  IRON_FENCE: 138,
  FENCE_POST: 139,

  // Furniture
  LADDER: 140,
  TORCH: 141,
  CHANDELIER: 142,
  IRON_GRATE: 143,
  POTTED_PLANT: 144,
  CRATE: 145,
  WELL: 146,
  ANVIL: 147,
  LANTERN: 148,
  FOUNTAIN: 149,

  // Structural / Decorative
  THATCH_ROOF: 150,
  WOOD_ROOF: 151,
  SLATE_ROOF: 152,
  DARK_FLOOR: 153,
  WHITE_WALL: 154,
  GARDEN_TILE: 155,
  GRAVEL: 156,
  SHALLOW_WATER: 157,
  STONE_CIRCLE: 158,
  GRAVESTONE: 159,
}

// Wall group base tile IDs - index 0 is the "pillar" (first tile in each wall set)
// Order: pillar, H, V, NW, NE, SW, SE, TD, TU, TR, TL, X
export const WALL_GROUPS = {
  stone: TILE.STONE_PILLAR,
  wood: TILE.WOOD_PILLAR,
  brick: TILE.BRICK_PILLAR,
}

export function getTileDef(id) {
  return TILE_DEFS[id] ?? TILE_DEFS[TILE.GRASS]
}
