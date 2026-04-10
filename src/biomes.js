import { TILE } from './tiles.js'
import { elevationNoise, temperatureNoise, moistureNoise, detailNoise, islandMask } from './noise.js'

export const BIOME = {
  OCEAN: 0,
  BEACH: 1,
  PLAINS: 2,
  FOREST: 3,
  DESERT: 4,
  JUNGLE: 5,
  SWAMP: 6,
  MOUNTAINS: 7,
  SNOWY_PEAKS: 8,
  TUNDRA: 9,
  TAIGA: 10,
}

export const BIOME_NAMES = [
  'Ocean', 'Beach', 'Plains', 'Forest', 'Desert',
  'Jungle', 'Swamp', 'Mountains', 'Snowy Peaks', 'Tundra', 'Taiga',
]

export const BIOME_COLORS = [
  '#1a4a8a', // Ocean
  '#d4c478', // Beach
  '#6a9a40', // Plains
  '#2a6a20', // Forest
  '#d4b050', // Desert
  '#0a5a08', // Jungle
  '#3a5a28', // Swamp
  '#7a7a7a', // Mountains
  '#d8d8e8', // Snowy Peaks
  '#889888', // Tundra
  '#3a6a40', // Taiga
]

export function getBiome(x, y) {
  // Island mask: force ocean outside the island, beach at the shore
  const land = islandMask(x, y)
  if (land < 0.05) return BIOME.OCEAN
  if (land < 0.35) return BIOME.BEACH

  const elev = elevationNoise(x, y)
  const temp = temperatureNoise(x, y)
  const moist = moistureNoise(x, y)

  // Inland lakes: keep some ocean patches from elevation noise
  if (elev < 0.28) return BIOME.OCEAN
  if (elev < 0.32 && land > 0.6) return BIOME.SWAMP

  if (elev > 0.78) {
    if (temp < 0.35) return BIOME.SNOWY_PEAKS
    return BIOME.MOUNTAINS
  }
  if (elev > 0.65) {
    if (temp < 0.3) return BIOME.SNOWY_PEAKS
    return BIOME.MOUNTAINS
  }

  if (temp < 0.30) {
    return moist > 0.50 ? BIOME.TAIGA : BIOME.TUNDRA
  }
  if (temp > 0.65) {
    if (moist < 0.35) return BIOME.DESERT
    if (moist > 0.60) return BIOME.JUNGLE
    return BIOME.PLAINS
  }

  // Temperate
  if (moist > 0.65 && elev < 0.42) return BIOME.SWAMP
  if (moist > 0.50) return BIOME.FOREST
  return BIOME.PLAINS
}

export function getBiomeColor(x, y) {
  return BIOME_COLORS[getBiome(x, y)]
}

// Tile selection per biome. The detail value (0-1) picks variant tiles.
const BIOME_TILES = {
  [BIOME.OCEAN](d) {
    return d < 0.33 ? TILE.WATER : d < 0.66 ? TILE.WATER_B : TILE.WATER_C
  },
  [BIOME.BEACH](d) {
    if (d > 0.92) return TILE.PALM_TREE
    return d < 0.5 ? TILE.BEACH_SAND : TILE.BEACH_SAND
  },
  [BIOME.PLAINS](d) {
    if (d > 0.93) return TILE.ROCK
    if (d > 0.85) return TILE.WILD_FLOWER
    if (d > 0.70) return TILE.TALL_GRASS
    if (d > 0.55) return TILE.FLOWER
    return d < 0.33 ? TILE.GRASS : d < 0.66 ? TILE.GRASS_B : TILE.GRASS_C
  },
  [BIOME.FOREST](d) {
    if (d > 0.75) return d > 0.87 ? TILE.DENSE_FOREST : TILE.TREE_B
    if (d > 0.65) return TILE.TREE_C
    if (d > 0.55) return TILE.FLOWER_B
    return d < 0.33 ? TILE.GRASS : d < 0.66 ? TILE.GRASS_B : TILE.GRASS_C
  },
  [BIOME.DESERT](d) {
    if (d > 0.95) return TILE.CACTUS
    if (d > 0.88) return TILE.DRY_BUSH
    if (d > 0.70) return TILE.DUNE
    return d < 0.5 ? TILE.SAND : TILE.SAND_B
  },
  [BIOME.JUNGLE](d) {
    if (d > 0.70) return d > 0.85 ? TILE.JUNGLE_TREE : TILE.JUNGLE_TREE_B
    if (d > 0.60) return TILE.VINE
    if (d > 0.50) return TILE.TROPICAL_FLOWER
    return TILE.JUNGLE_FLOOR
  },
  [BIOME.SWAMP](d) {
    if (d > 0.85) return TILE.DEAD_TREE
    if (d > 0.70) return TILE.MARSH
    if (d > 0.50) return TILE.MUD
    return d < 0.5 ? TILE.SWAMP : TILE.SWAMP_B
  },
  [BIOME.MOUNTAINS](d) {
    if (d > 0.90) return TILE.ROCK
    return d < 0.33 ? TILE.MOUNTAIN : d < 0.66 ? TILE.MOUNTAIN_B : TILE.MOUNTAIN_C
  },
  [BIOME.SNOWY_PEAKS](d) {
    if (d > 0.88) return TILE.FROZEN_TREE
    if (d > 0.75) return TILE.ICE
    return d < 0.5 ? TILE.SNOW : TILE.SNOW_B
  },
  [BIOME.TUNDRA](d) {
    if (d > 0.90) return TILE.FROZEN_TREE_B
    if (d > 0.70) return TILE.ROCK
    return d < 0.5 ? TILE.TUNDRA_GRASS : TILE.SNOW
  },
  [BIOME.TAIGA](d) {
    if (d > 0.70) return d > 0.85 ? TILE.TAIGA_TREE : TILE.TAIGA_TREE_B
    if (d > 0.55) return TILE.FROZEN_TREE
    return TILE.TAIGA_FLOOR
  },
}

export function getTileForBiome(biome, detailValue) {
  const fn = BIOME_TILES[biome]
  return fn ? fn(detailValue) : TILE.GRASS
}

export function getWorldTile(x, y) {
  const biome = getBiome(x, y)
  const d = detailNoise(x, y)
  return getTileForBiome(biome, d)
}
