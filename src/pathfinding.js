import { isSolid } from './world.js'

const MAX_NODES = 2000
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]]

/**
 * A* from (sx,sy) to (tx,ty). Returns array of {x,y} waypoints (excluding start),
 * or null if no path found within the node budget.
 * @param {*} world
 * @param {number} sx
 * @param {number} sy
 * @param {number} tx
 * @param {number} ty
 * @param {(x: number, y: number) => boolean} blockedByEntity
 * @returns {{x: number, y: number}[] | null}
 */
export function findPath(world, sx, sy, tx, ty, blockedByEntity) {
  if (sx === tx && sy === ty) return []
  if (isSolid(world, tx, ty)) return null

  const key = (x, y) => (x + 100000) * 200001 + (y + 100000)
  const gMap = new Map()
  const cameFrom = new Map()

  const openSet = []
  const startKey = key(sx, sy)
  gMap.set(startKey, 0)
  openSet.push({ x: sx, y: sy, f: heuristic(sx, sy, tx, ty) })

  let expanded = 0

  while (openSet.length > 0) {
    if (++expanded > MAX_NODES) return null

    let bestIdx = 0
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIdx].f) bestIdx = i
    }
    const curr = openSet[bestIdx]
    openSet[bestIdx] = openSet[openSet.length - 1]
    openSet.pop()

    if (curr.x === tx && curr.y === ty) {
      return reconstructPath(cameFrom, key, tx, ty, sx, sy)
    }

    const currKey = key(curr.x, curr.y)
    const currG = gMap.get(currKey)

    for (const [ddx, ddy] of DIRS) {
      const nx = curr.x + ddx
      const ny = curr.y + ddy
      if (isSolid(world, nx, ny)) continue
      // Allow the target tile even if an entity is on it (player will stop adjacent)
      if (nx !== tx || ny !== ty) {
        if (blockedByEntity(nx, ny)) continue
      }

      const nKey = key(nx, ny)
      const newG = currG + 1
      const prevG = gMap.get(nKey)
      if (prevG !== undefined && newG >= prevG) continue

      gMap.set(nKey, newG)
      cameFrom.set(nKey, currKey)
      openSet.push({ x: nx, y: ny, f: newG + heuristic(nx, ny, tx, ty) })
    }
  }

  return null
}

function heuristic(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by)
}

function reconstructPath(cameFrom, keyFn, tx, ty, sx, sy) {
  const path = []
  let cx = tx
  let cy = ty
  const sKey = keyFn(sx, sy)

  while (true) {
    const k = keyFn(cx, cy)
    if (k === sKey) break
    path.push({ x: cx, y: cy })
    const prev = cameFrom.get(k)
    if (prev === undefined) break
    cx = Math.floor(prev / 200001) - 100000
    cy = prev % 200001 - 100000
  }

  path.reverse()
  return path
}
