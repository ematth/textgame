// 2D Simplex noise implementation (no dependencies)
// Based on Stefan Gustavson's simplex noise algorithm

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6

const grad3 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, 1], [1, -1], [-1, -1],
]

const PERM_SIZE = 512
const perm = new Uint8Array(PERM_SIZE * 2)
const permMod12 = new Uint8Array(PERM_SIZE * 2)

function buildPermutation(seed) {
  const p = new Uint8Array(PERM_SIZE)
  for (let i = 0; i < PERM_SIZE; i++) p[i] = i

  let s = seed | 0
  function rng() {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0)
  }

  for (let i = PERM_SIZE - 1; i > 0; i--) {
    const j = rng() % (i + 1)
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp
  }

  for (let i = 0; i < PERM_SIZE; i++) {
    perm[i] = perm[i + PERM_SIZE] = p[i]
    permMod12[i] = permMod12[i + PERM_SIZE] = p[i] % 12
  }
}

buildPermutation(0)

export function setSeed(seed) {
  buildPermutation(seed)
}

export function simplex2(x, y) {
  const s = (x + y) * F2
  const i = Math.floor(x + s)
  const j = Math.floor(y + s)
  const t = (i + j) * G2
  const X0 = i - t
  const Y0 = j - t
  const x0 = x - X0
  const y0 = y - Y0

  let i1, j1
  if (x0 > y0) { i1 = 1; j1 = 0 }
  else { i1 = 0; j1 = 1 }

  const x1 = x0 - i1 + G2
  const y1 = y0 - j1 + G2
  const x2 = x0 - 1 + 2 * G2
  const y2 = y0 - 1 + 2 * G2

  const ii = i & 0x1ff
  const jj = j & 0x1ff

  let n0 = 0, n1 = 0, n2 = 0

  let t0 = 0.5 - x0 * x0 - y0 * y0
  if (t0 >= 0) {
    t0 *= t0
    const gi0 = permMod12[ii + perm[jj]]
    n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0)
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1
  if (t1 >= 0) {
    t1 *= t1
    const gi1 = permMod12[ii + i1 + perm[jj + j1]]
    n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1)
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2
  if (t2 >= 0) {
    t2 *= t2
    const gi2 = permMod12[ii + 1 + perm[jj + 1]]
    n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2)
  }

  return 70 * (n0 + n1 + n2)
}

export function fbm(x, y, octaves = 6, lacunarity = 2, persistence = 0.5) {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplex2(x * frequency, y * frequency)
    max += amplitude
    amplitude *= persistence
    frequency *= lacunarity
  }
  return value / max
}

// Separate noise "channels" using coordinate offsets so each is independent
const OFFSET = 31337.77

export function elevationNoise(x, y) {
  return fbm(x * 0.0003, y * 0.0003, 6) * 0.5 + 0.5
}

export function temperatureNoise(x, y) {
  const latBias = y / 50000
  return fbm((x + OFFSET) * 0.0002, (y + OFFSET) * 0.0002, 4) * 0.4 + 0.5 + (latBias - 0.5) * 0.3
}

export function moistureNoise(x, y) {
  return fbm((x + OFFSET * 2) * 0.00025, (y + OFFSET * 2) * 0.00025, 5) * 0.5 + 0.5
}

export function detailNoise(x, y) {
  return fbm(x * 0.05, y * 0.05, 3, 2, 0.5) * 0.5 + 0.5
}

// Island mask: returns 0 (deep ocean) to 1 (solid land).
// Produces a single large, wacky-shaped island centered in the world.
const ISLAND_CX = 25000
const ISLAND_CY = 25000
const ISLAND_RADIUS = 18000 // base radius before distortion

export function islandMask(x, y) {
  const dx = x - ISLAND_CX
  const dy = y - ISLAND_CY
  const dist = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  // Multi-frequency polar distortion for wacky coastline
  let radialWarp = 0
  radialWarp += 0.30 * simplex2(angle * 1.2 + 100, dist * 0.00005 + 200)
  radialWarp += 0.20 * simplex2(angle * 2.5 + 300, dist * 0.0001 + 400)
  radialWarp += 0.12 * simplex2(angle * 5.0 + 500, dist * 0.0002 + 600)
  radialWarp += 0.06 * simplex2(angle * 10.0 + 700, dist * 0.0004 + 800)

  // Large-scale lobes: 3-5 bulges sticking out like arms
  const lobes = 0.25 * simplex2(angle * 0.6 + 50, 3.0)
    + 0.15 * simplex2(angle * 1.1 + 90, 7.0)

  // 2D noise warp for bays and inlets (position-based, not just angle)
  const xyWarp = 0.18 * fbm(x * 0.00015 + OFFSET * 3, y * 0.00015 + OFFSET * 3, 4)

  const effectiveRadius = ISLAND_RADIUS * (1 + radialWarp + lobes + xyWarp)
  const normalizedDist = dist / effectiveRadius

  // Smooth falloff: 1 in center, drops to 0 at the edge
  if (normalizedDist < 0.85) return 1.0
  if (normalizedDist > 1.05) return 0.0
  return 1.0 - (normalizedDist - 0.85) / 0.20
}
