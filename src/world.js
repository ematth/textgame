import { TILE, getTileDef } from './tiles.js'

const W = 300
const H = 300

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

/**
 * @returns {{ width: number, height: number, tiles: Uint16Array }}
 */
export function generateWorld() {
  const tiles = new Uint16Array(W * H)

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
      } else if (n > 0.72 && wave >= -1.4) {
        t = v < 0.33 ? TILE.MOUNTAIN : v < 0.66 ? TILE.MOUNTAIN_B : TILE.MOUNTAIN_C
      } else if (n > 0.52 && n <= 0.62) {
        // Walkable “tree” coverage is intentionally kept lower.
        t = v < 0.34 ? TILE.DENSE_FOREST : v < 0.67 ? TILE.TREE_B : TILE.TREE_C
      } else if (noise2(x * 3.1, y * 3.7) > 0.93) {
        t = v < 0.5 ? TILE.FLOWER : TILE.FLOWER_B
      } else {
        // Grass variants for visual variety.
        t = v < 0.33 ? TILE.GRASS : v < 0.66 ? TILE.GRASS_B : TILE.GRASS_C
      }

      tiles[y * W + x] = t
    }
  }

  // Stone paths: main cross + diagonals (skip water / mountains)
  const cx = (W / 2) | 0
  const cy = (H / 2) | 0
  for (let x = 20; x < W - 20; x++) {
    paintPath(tiles, x, cy)
  }
  for (let y = 20; y < H - 20; y++) {
    paintPath(tiles, cx, y)
  }
  for (let i = -30; i <= 30; i++) {
    paintPath(tiles, cx + i, cy + i)
    paintPath(tiles, cx + i, cy - i)
  }

  // Hand-placed building (tavern) overlapping the path hub
  const bx = cx - 8
  const by = cy - 6
  const bw = 14
  const bh = 8
  for (let yy = by; yy < by + bh; yy++) {
    for (let xx = bx; xx < bx + bw; xx++) {
      if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue
      const edge = xx === bx || xx === bx + bw - 1 || yy === by || yy === by + bh - 1
      const door = xx === bx + (bw >> 1) && yy === by + bh - 1
      if (door) {
        tiles[yy * W + xx] = TILE.DOOR
      } else if (edge) {
        let corner = TILE.BOX_H
        if (xx === bx && yy === by) corner = TILE.BOX_NW
        else if (xx === bx + bw - 1 && yy === by) corner = TILE.BOX_NE
        else if (xx === bx && yy === by + bh - 1) corner = TILE.BOX_SW
        else if (xx === bx + bw - 1 && yy === by + bh - 1) corner = TILE.BOX_SE
        else if (yy === by || yy === by + bh - 1) corner = TILE.BOX_H
        else corner = TILE.BOX_V
        tiles[yy * W + xx] = corner
      } else {
        tiles[yy * W + xx] = TILE.FLOOR
      }
    }
  }

  // Guarantee a walkable buffer around the starting house and a clear exit lane.
  const doorX = bx + (bw >> 1)
  const doorY = by + bh - 1
  clearWalkableRect(tiles, bx - 2, by - 2, bx + bw + 1, by + bh + 2)
  for (let y = doorY; y <= doorY + 8; y++) {
    forcePath(tiles, doorX, y)
  }
  for (let x = doorX - 3; x <= doorX + 3; x++) {
    forcePath(tiles, x, cy)
  }

  return { width: W, height: H, tiles }
}

function paintPath(tiles, x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return
  const cur = tiles[y * W + x]
  if (getTileDef(cur).solid) return
  tiles[y * W + x] = TILE.PATH
}

function forcePath(tiles, x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return
  const cur = tiles[y * W + x]
  if (
    cur === TILE.BOX_H ||
    cur === TILE.BOX_V ||
    cur === TILE.BOX_NW ||
    cur === TILE.BOX_NE ||
    cur === TILE.BOX_SW ||
    cur === TILE.BOX_SE ||
    cur === TILE.BOX_L ||
    cur === TILE.BOX_R ||
    cur === TILE.BOX_T ||
    cur === TILE.BOX_B
  ) {
    return
  }
  tiles[y * W + x] = TILE.PATH
}

function clearWalkableRect(tiles, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      const cur = tiles[y * W + x]
      if (
        cur === TILE.BOX_H ||
        cur === TILE.BOX_V ||
        cur === TILE.BOX_NW ||
        cur === TILE.BOX_NE ||
        cur === TILE.BOX_SW ||
        cur === TILE.BOX_SE ||
        cur === TILE.BOX_L ||
        cur === TILE.BOX_R ||
        cur === TILE.BOX_T ||
        cur === TILE.BOX_B ||
        cur === TILE.DOOR ||
        cur === TILE.FLOOR
      ) {
        continue
      }
      tiles[y * W + x] = TILE.GRASS
    }
  }
}

export function getTile(world, x, y) {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return TILE.MOUNTAIN
  return world.tiles[y * world.width + x]
}

export function isSolid(world, x, y) {
  const id = getTile(world, x, y)
  return getTileDef(id).solid
}
