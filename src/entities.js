import { isSolid } from './world.js'

/**
 * @typedef {{ id: string, kind: 'npc', x: number, y: number, char: string, fg: string, name: string, dialog: string, wanderCooldown: number }} Npc
 * @typedef {{ id: string, kind: 'object', x: number, y: number, char: string, fg: string, bg: string, label: string, dialog: string }} WorldObject
 */

/** @param {import('./world.js').generateWorld extends () => infer W ? W : never} world */
export function createEntities(world) {
  const cx = (world.width / 2) | 0
  const cy = (world.height / 2) | 0

  /** @type {(Npc|WorldObject)[]} */
  const list = [
    {
      id: 'merchant',
      kind: 'npc',
      x: cx + 12,
      y: cy,
      char: 'M',
      fg: '#e8c080',
      name: 'Merchant',
      dialog:
        'Welcome, traveler! I sell maps and rumors. The western hills hide old ruins — mind the snakes.',
      wanderCooldown: 0,
    },
    {
      id: 'wizard',
      kind: 'npc',
      x: cx - 15,
      y: cy - 8,
      char: 'W',
      fg: '#a78bfa',
      name: 'Wizard',
      dialog:
        'The ley lines twist near the crossroads. If you hear whispers in the water, do not answer.',
      wanderCooldown: 0,
    },
    {
      id: 'guard',
      kind: 'npc',
      x: cx,
      y: cy + 18,
      char: 'G',
      fg: '#94a3b8',
      name: 'Guard',
      dialog: 'Roads are safe as far as the river. Beyond that, you are on your own.',
      wanderCooldown: 0,
    },
    {
      id: 'chest1',
      kind: 'object',
      x: cx - 3,
      y: cy - 2,
      char: '■',
      fg: '#c4944e',
      bg: '#2a2218',
      label: 'Chest',
      dialog: 'A sturdy wooden chest. It is locked, but something rattles inside.',
    },
    {
      id: 'sign1',
      kind: 'object',
      x: cx + 20,
      y: cy + 3,
      char: '!',
      fg: '#fbbf24',
      bg: '#1a2e15',
      label: 'Sign',
      dialog: 'North: Highland Pass — East: Marsh Flats — South: River Ford',
    },
    {
      id: 'fire1',
      kind: 'object',
      x: cx - 20,
      y: cy + 10,
      char: '*',
      fg: '#f97316',
      bg: '#1a2e15',
      label: 'Campfire',
      dialog: 'Warm embers crackle. Good place to rest.',
    },
  ]

  for (const e of list) {
    if (e.x < 0) e.x = 5
    if (e.y < 0) e.y = 5
    if (e.x >= world.width) e.x = world.width - 5
    if (e.y >= world.height) e.y = world.height - 5
    while (isSolid(world, e.x, e.y)) {
      e.y -= 1
      if (e.y < 0) {
        e.y = cy
        break
      }
    }
  }

  return { list }
}

function occupiedByOther(list, x, y, except) {
  for (const e of list) {
    if (e === except) continue
    if (e.x === x && e.y === y) return true
  }
  return false
}

/**
 * @param {{ list: (Npc|WorldObject)[] }} entities
 * @param {*} world
 * @param {number} playerX
 * @param {number} playerY
 * @param {number} dtMs
 */
export function updateEntities(entities, world, playerX, playerY, dtMs, now) {
  const { list } = entities
  for (const e of list) {
    if (e.kind !== 'npc') continue

    e.wanderCooldown -= dtMs
    if (e.wanderCooldown > 0) continue

    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]
    const pick = dirs[(Math.random() * 4) | 0]
    const nx = e.x + pick[0]
    const ny = e.y + pick[1]

    if (isSolid(world, nx, ny)) {
      e.wanderCooldown = 400 + Math.random() * 600
      continue
    }
    if (nx === playerX && ny === playerY) {
      e.wanderCooldown = 500
      continue
    }
    if (occupiedByOther(list, nx, ny, e)) {
      e.wanderCooldown = 300
      continue
    }

    e.x = nx
    e.y = ny
    e.wanderCooldown = 800 + Math.random() * 1200
  }
}

export function entityBlocksTile(entities, x, y) {
  for (const e of entities.list) {
    if (e.kind === 'npc' && e.x === x && e.y === y) return true
  }
  return false
}

function chebyshev(px, py, ex, ey) {
  return Math.max(Math.abs(px - ex), Math.abs(py - ey))
}

/**
 * NPCs: must be adjacent (distance 1), not same tile.
 * Objects: same tile or adjacent.
 * @returns {Npc|WorldObject|null}
 */
export function findInteractTarget(entities, playerX, playerY) {
  let npc = null
  let obj = null
  for (const e of entities.list) {
    const d = chebyshev(playerX, playerY, e.x, e.y)
    if (e.kind === 'npc') {
      if (d !== 1) continue
      npc = /** @type {Npc} */ (e)
    } else {
      if (d > 1) continue
      obj = /** @type {WorldObject} */ (e)
    }
  }
  return npc ?? obj
}
