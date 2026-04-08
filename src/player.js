import { isSolid } from './world.js'

const STEP_MS = 120

export function createPlayer(x, y) {
  return {
    x,
    y,
    nextMoveAt: 0,
  }
}

/**
 * @param {ReturnType<typeof createPlayer>} player
 * @param {{ dx: number, dy: number }} dir
 * @param {*} world
 * @param {(x: number, y: number) => boolean} blockedByEntity - true if tile blocked by NPC/object
 */
export function tryMovePlayer(player, dir, world, blockedByEntity, now) {
  if (!dir || now < player.nextMoveAt) return
  const nx = player.x + dir.dx
  const ny = player.y + dir.dy
  if (isSolid(world, nx, ny)) return
  if (blockedByEntity(nx, ny)) return
  player.x = nx
  player.y = ny
  player.nextMoveAt = now + STEP_MS
}
