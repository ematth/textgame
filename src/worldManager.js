import { buildSpatialHash } from './spatialHash.js'

/**
 * @typedef {{
 *   x: number, y: number,
 *   targetWorldId: string, targetX: number, targetY: number
 * }} Portal
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   width: number,
 *   height: number,
 *   tiles: Uint16Array,
 *   portals: Portal[],
 *   entities: { list: any[] },
 *   spatialHash: ReturnType<typeof buildSpatialHash>
 * }} World
 */

export function createWorldManager() {
  /** @type {Map<string, World>} */
  const worlds = new Map()
  let activeWorldId = ''

  function registerWorld(world) {
    if (!world.spatialHash) {
      world.spatialHash = buildSpatialHash(world.entities.list)
    }
    if (!world.portals) world.portals = []
    worlds.set(world.id, world)
  }

  function setActiveWorld(id) {
    activeWorldId = id
  }

  function getActiveWorld() {
    return worlds.get(activeWorldId)
  }

  function getWorld(id) {
    return worlds.get(id)
  }

  function addPortal(worldId, x, y, targetWorldId, targetX, targetY) {
    const w = worlds.get(worldId)
    if (!w) return
    w.portals.push({ x, y, targetWorldId, targetX, targetY })
  }

  function checkPortal(worldId, x, y) {
    const w = worlds.get(worldId)
    if (!w) return null
    for (const p of w.portals) {
      if (p.x === x && p.y === y) return p
    }
    return null
  }

  function transition(player, portal) {
    player.x = portal.targetX
    player.y = portal.targetY
    activeWorldId = portal.targetWorldId
  }

  function allWorlds() {
    return worlds.values()
  }

  return {
    registerWorld,
    setActiveWorld,
    getActiveWorld,
    getWorld,
    addPortal,
    checkPortal,
    transition,
    allWorlds,
  }
}
