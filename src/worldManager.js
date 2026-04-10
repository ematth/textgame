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

  // Fast portal lookup: worldId -> Map<"x,y" -> portal>
  const portalIndex = new Map()

  function registerWorld(world) {
    if (!world.spatialHash) {
      world.spatialHash = buildSpatialHash(world.entities.list)
    }
    if (!world.portals) world.portals = []
    worlds.set(world.id, world)
    // Index existing portals
    if (!portalIndex.has(world.id)) portalIndex.set(world.id, new Map())
    const idx = portalIndex.get(world.id)
    for (const p of world.portals) {
      idx.set(`${p.x},${p.y}`, p)
    }
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
    const portal = { x, y, targetWorldId, targetX, targetY }
    w.portals.push(portal)
    if (!portalIndex.has(worldId)) portalIndex.set(worldId, new Map())
    portalIndex.get(worldId).set(`${x},${y}`, portal)
  }

  function checkPortal(worldId, x, y) {
    const idx = portalIndex.get(worldId)
    if (!idx) return null
    return idx.get(`${x},${y}`) ?? null
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
