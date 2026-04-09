import { isSolid } from './world.js'

/**
 * @typedef {{
 *   id: string, kind: 'npc', x: number, y: number, char: string, fg: string,
 *   name: string, role: string, dialog: string, wanderCooldown: number,
 *   route: { waypoints: {x:number,y:number}[], currentIndex: number } | null
 * }} Npc
 *
 * @typedef {{
 *   id: string, kind: 'object', x: number, y: number, char: string,
 *   fg: string, bg: string, label: string, dialog: string
 * }} WorldObject
 */

const CULL_RADIUS = 60

/**
 * Update all NPCs in the active world within culling radius of the player.
 * Uses the world's spatial hash for collision checks.
 */
export function updateEntities(world, playerX, playerY, dtMs, now) {
  const { list } = world.entities
  const hash = world.spatialHash
  if (!hash) return

  for (let i = 0; i < list.length; i++) {
    const e = list[i]
    if (e.kind !== 'npc') continue

    // Cull distant NPCs
    const dx = e.x - playerX
    const dy = e.y - playerY
    if (dx * dx + dy * dy > CULL_RADIUS * CULL_RADIUS) continue

    e.wanderCooldown -= dtMs
    if (e.wanderCooldown > 0) continue

    const oldX = e.x
    const oldY = e.y

    if (e.route && e.route.waypoints.length > 0) {
      moveAlongRoute(e, world, hash, playerX, playerY)
    } else {
      wanderRandom(e, world, hash, playerX, playerY)
    }

    if (e.x !== oldX || e.y !== oldY) {
      hash.move(e, oldX, oldY)
    }
  }
}

function moveAlongRoute(e, world, hash, playerX, playerY) {
  const route = e.route
  const target = route.waypoints[route.currentIndex]
  const tdx = target.x - e.x
  const tdy = target.y - e.y

  if (Math.abs(tdx) <= 1 && Math.abs(tdy) <= 1) {
    route.currentIndex = (route.currentIndex + 1) % route.waypoints.length
    e.wanderCooldown = 200 + Math.random() * 400
    return
  }

  // Greedy axis-aligned: prefer the axis with larger delta
  let stepX = 0
  let stepY = 0
  if (Math.abs(tdx) >= Math.abs(tdy)) {
    stepX = tdx > 0 ? 1 : -1
  } else {
    stepY = tdy > 0 ? 1 : -1
  }

  let nx = e.x + stepX
  let ny = e.y + stepY

  if (canMoveTo(nx, ny, e, world, hash, playerX, playerY)) {
    e.x = nx
    e.y = ny
    e.wanderCooldown = 150 + Math.random() * 250
    return
  }

  // Fallback: try the other axis
  if (stepX !== 0 && tdy !== 0) {
    nx = e.x
    ny = e.y + (tdy > 0 ? 1 : -1)
  } else if (stepY !== 0 && tdx !== 0) {
    nx = e.x + (tdx > 0 ? 1 : -1)
    ny = e.y
  } else {
    e.wanderCooldown = 400 + Math.random() * 600
    return
  }

  if (canMoveTo(nx, ny, e, world, hash, playerX, playerY)) {
    e.x = nx
    e.y = ny
    e.wanderCooldown = 150 + Math.random() * 250
  } else {
    e.wanderCooldown = 400 + Math.random() * 600
  }
}

function wanderRandom(e, world, hash, playerX, playerY) {
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]
  const pick = dirs[(Math.random() * 4) | 0]
  const nx = e.x + pick[0]
  const ny = e.y + pick[1]

  if (canMoveTo(nx, ny, e, world, hash, playerX, playerY)) {
    e.x = nx
    e.y = ny
    e.wanderCooldown = 800 + Math.random() * 1200
  } else {
    e.wanderCooldown = 400 + Math.random() * 600
  }
}

function canMoveTo(nx, ny, entity, world, hash, playerX, playerY) {
  if (isSolid(world, nx, ny)) return false
  if (nx === playerX && ny === playerY) return false
  if (hash.hasEntityAt(nx, ny, entity)) return false
  return true
}

/**
 * Check if any NPC blocks the given tile (used for player movement).
 */
export function entityBlocksTile(world, x, y) {
  if (!world.spatialHash) return false
  return world.spatialHash.hasNpcAt(x, y)
}

function chebyshev(px, py, ex, ey) {
  return Math.max(Math.abs(px - ex), Math.abs(py - ey))
}

/**
 * Find nearest interactable entity adjacent to the player.
 * NPCs: distance exactly 1. Objects: distance <= 1.
 */
export function findInteractTarget(world, playerX, playerY) {
  if (!world.spatialHash) return null
  const nearby = world.spatialHash.getInRect(playerX - 1, playerY - 1, playerX + 1, playerY + 1)

  let npc = null
  let obj = null
  for (const e of nearby) {
    const d = chebyshev(playerX, playerY, e.x, e.y)
    if (e.kind === 'npc') {
      if (d === 1) npc = e
    } else {
      if (d <= 1) obj = e
    }
  }
  return npc ?? obj
}
