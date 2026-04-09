import { isSolid } from './world.js'
import { getRelation, setRelation } from './relationships.js'
import { getFactionDisposition, isCriminalRole } from './factions.js'
import { addMemory, decayCorpses } from './combat.js'
import { updateNeeds, getUrgentNeed, satisfyNeed } from './needs.js'
import { getPhase, getScheduleForPhase } from './worldClock.js'

const CULL_RADIUS = 60
const INTERACT_RADIUS = 2
const BRAWL_RADIUS = 4
const COMBAT_TICK_MS = 1200

// ============================================================
// MAIN UPDATE
// ============================================================

export function updateEntities(world, playerX, playerY, dtMs, now, damageQueue, worldManager) {
  const { list } = world.entities
  const hash = world.spatialHash
  if (!hash) return

  const npcById = new Map()
  for (let i = 0; i < list.length; i++) {
    const e = list[i]
    if (e.kind === 'npc') npcById.set(e.id, e)
  }

  const phase = getPhase()

  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i]
    if (e.kind !== 'npc') continue
    if (!e.alive) continue
    if (e.talkingToPlayer) continue

    const dx = e.x - playerX
    const dy = e.y - playerY
    if (dx * dx + dy * dy > CULL_RADIUS * CULL_RADIUS) continue

    // --- Needs ---
    updateNeeds(e, dtMs)

    // --- Schedule ---
    updateSchedule(e, phase, world)

    // --- Emote expiry ---
    if (e.emote && now >= e.emoteExpiry) {
      e.emote = null
    }

    // --- Interaction cooldown ---
    if (e.interactionCooldown > 0) e.interactionCooldown -= dtMs

    // --- Combat ---
    if (e.combatState) {
      handleCombat(e, world, hash, npcById, damageQueue, now, dtMs)
      continue
    }

    // --- Flee ---
    if (e.fleeState) {
      if (now >= e.fleeState.until) {
        e.fleeState = null
      } else {
        handleFlee(e, world, hash, playerX, playerY)
        continue
      }
    }

    // --- Wander cooldown ---
    e.wanderCooldown -= dtMs
    if (e.wanderCooldown > 0) continue

    const oldX = e.x
    const oldY = e.y

    // --- Building pathfinding ---
    if (e.destination) {
      const transferred = handleDestination(e, world, hash, playerX, playerY, worldManager, now, dtMs)
      if (transferred) {
        // NPC left this world, skip rest
        npcById.delete(e.id)
        continue
      }
    } else if (e.route && e.route.waypoints.length > 0) {
      moveAlongRoute(e, world, hash, playerX, playerY)
    } else {
      wanderRandom(e, world, hash, playerX, playerY)
    }

    if (e.x !== oldX || e.y !== oldY) {
      hash.move(e, oldX, oldY)
    }

    // --- Check NPC interactions ---
    if (!e.combatState && e.interactionCooldown <= 0) {
      checkInteractions(e, world, hash, npcById, now)
    }
  }

  // --- Corpse decay ---
  decayCorpses(world, now)
}

// ============================================================
// SCHEDULE
// ============================================================

function updateSchedule(npc, phase, world) {
  if (npc.combatState || npc.fleeState) return

  const newSchedule = getScheduleForPhase(phase, npc.role)
  if (newSchedule === npc.schedule) return
  npc.schedule = newSchedule

  if (npc.destination && npc.destination.state === 'inside') return

  if (newSchedule === 'sleep' && npc.home) {
    npc.destination = {
      buildingId: npc.home.buildingId,
      doorX: npc.home.doorX, doorY: npc.home.doorY,
      state: 'traveling', insideTimer: 0,
    }
  } else if (newSchedule === 'eat' && npc.home) {
    npc.destination = {
      buildingId: npc.home.buildingId,
      doorX: npc.home.doorX, doorY: npc.home.doorY,
      state: 'traveling', insideTimer: 0,
    }
  } else {
    if (npc.destination && npc.destination.state === 'traveling') {
      npc.destination = null
    }
  }
}

// ============================================================
// COMBAT
// ============================================================

function shouldFlee(npc) {
  const ratio = npc.hp / npc.maxHp
  if (npc.bravery >= 0.7) return false
  if (npc.bravery < 0.3) return ratio < 0.4
  return ratio < 0.2
}

function handleCombat(npc, world, hash, npcById, damageQueue, now, dtMs) {
  const cs = npc.combatState
  cs.tickCooldown -= dtMs

  const target = npcById.get(cs.targetId)
  if (!target || !target.alive) {
    npc.combatState = null
    npc.emote = '*'
    npc.emoteExpiry = now + 2000
    npc.wanderCooldown = 500
    return
  }

  if (shouldFlee(npc)) {
    npc.combatState = null
    npc.emote = 'X'
    npc.emoteExpiry = now + 2000
    npc.fleeState = { fromX: target.x, fromY: target.y, until: now + 5000 }
    addMemory(npc, 'attacked_by', now, { attackerId: target.id, attackerName: target.name })
    return
  }

  // Move toward target if not adjacent
  const dist = chebyshev(npc.x, npc.y, target.x, target.y)
  if (dist > 1) {
    const oldX = npc.x
    const oldY = npc.y
    moveToward(npc, target.x, target.y, world, hash, npc.x, npc.y)
    if (npc.x !== oldX || npc.y !== oldY) hash.move(npc, oldX, oldY)
    npc.wanderCooldown = 200
    return
  }

  if (cs.tickCooldown > 0) return

  cs.tickCooldown = COMBAT_TICK_MS + Math.random() * 400

  damageQueue.enqueue(npc, target, npc.attack, 'melee', world)
  addMemory(npc, 'attacked_by', now, { attackerId: target.id, attackerName: target.name })

  // Target retaliates
  if (!target.combatState) {
    target.combatState = { targetId: npc.id, tickCooldown: 600 }
    target.emote = '!'
    target.emoteExpiry = now + 2000
  }

  // Brawl escalation
  checkBrawlEscalation(npc, target, world, hash, npcById, now)

  npc.wanderCooldown = 300
}

function checkBrawlEscalation(attacker, defender, world, hash, npcById, now) {
  const cx = (attacker.x + defender.x) >> 1
  const cy = (attacker.y + defender.y) >> 1
  const nearby = hash.getInRect(cx - BRAWL_RADIUS, cy - BRAWL_RADIUS, cx + BRAWL_RADIUS, cy + BRAWL_RADIUS)

  for (const e of nearby) {
    if (e.kind !== 'npc' || !e.alive || e.combatState) continue
    if (e.id === attacker.id || e.id === defender.id) continue

    if (Math.random() > e.loyalty) continue

    const dispToAttacker = getEffectiveDisposition(e, attacker)
    const dispToDefender = getEffectiveDisposition(e, defender)

    let joinTarget = null

    if (dispToAttacker === 'friendly' && dispToDefender !== 'friendly') {
      joinTarget = defender
    } else if (dispToDefender === 'friendly' && dispToAttacker !== 'friendly') {
      joinTarget = attacker
    } else if (['Guard', 'Soldier', 'Knight'].includes(e.role)) {
      if (isCriminalRole(defender.role)) joinTarget = defender
      else if (isCriminalRole(attacker.role)) joinTarget = attacker
    }

    if (joinTarget) {
      e.combatState = { targetId: joinTarget.id, tickCooldown: 300 }
      e.emote = '!'
      e.emoteExpiry = now + 2000
      e.mood = 'irritable'
    }
  }
}

// ============================================================
// FLEE
// ============================================================

function handleFlee(npc, world, hash, playerX, playerY) {
  npc.wanderCooldown = 200
  const fdx = npc.x - npc.fleeState.fromX
  const fdy = npc.y - npc.fleeState.fromY
  let sx = fdx === 0 ? (Math.random() < 0.5 ? -1 : 1) : (fdx > 0 ? 1 : -1)
  let sy = fdy === 0 ? (Math.random() < 0.5 ? -1 : 1) : (fdy > 0 ? 1 : -1)

  const oldX = npc.x
  const oldY = npc.y

  let nx = npc.x + sx
  let ny = npc.y + sy
  if (canMoveTo(nx, ny, npc, world, hash, playerX, playerY)) {
    npc.x = nx; npc.y = ny
  } else {
    nx = npc.x + sx; ny = npc.y
    if (canMoveTo(nx, ny, npc, world, hash, playerX, playerY)) {
      npc.x = nx; npc.y = ny
    } else {
      nx = npc.x; ny = npc.y + sy
      if (canMoveTo(nx, ny, npc, world, hash, playerX, playerY)) {
        npc.x = nx; npc.y = ny
      }
    }
  }

  if (npc.x !== oldX || npc.y !== oldY) hash.move(npc, oldX, oldY)
}

// ============================================================
// BUILDING PATHFINDING
// ============================================================

function handleDestination(npc, world, hash, playerX, playerY, worldManager, now, dtMs) {
  const dest = npc.destination

  if (dest.state === 'traveling') {
    const distToDoor = chebyshev(npc.x, npc.y, dest.doorX, dest.doorY)
    if (distToDoor <= 1) {
      const portal = worldManager.checkPortal(world.id, dest.doorX, dest.doorY)
      if (portal) {
        const targetWorld = worldManager.getWorld(portal.targetWorldId)
        if (targetWorld) {
          transferEntity(npc, world, targetWorld, portal.targetX, portal.targetY)
          dest.state = 'inside'
          dest.insideTimer = 15000 + Math.random() * 30000
          satisfyNeed(npc, 'hunger')
          satisfyNeed(npc, 'thirst')
          satisfyNeed(npc, 'rest')
          return true
        }
      }
      npc.destination = null
      npc.wanderCooldown = 1000
      return false
    }
    moveToward(npc, dest.doorX, dest.doorY, world, hash, playerX, playerY)
    npc.wanderCooldown = 150 + Math.random() * 200
    return false
  }

  if (dest.state === 'inside') {
    dest.insideTimer -= dtMs
    if (dest.insideTimer <= 0) {
      dest.state = 'exiting'
      const exits = world.portals.filter(p => p.targetWorldId === 'overworld')
      if (exits.length > 0) {
        dest.exitX = exits[0].x
        dest.exitY = exits[0].y
      } else {
        npc.destination = null
      }
    }
    return false
  }

  if (dest.state === 'exiting') {
    if (dest.exitX === undefined) {
      npc.destination = null
      return false
    }
    const distToExit = chebyshev(npc.x, npc.y, dest.exitX, dest.exitY)
    if (distToExit <= 1) {
      const portal = worldManager.checkPortal(world.id, dest.exitX, dest.exitY)
      if (portal) {
        const targetWorld = worldManager.getWorld(portal.targetWorldId)
        if (targetWorld) {
          transferEntity(npc, world, targetWorld, portal.targetX, portal.targetY)
          npc.destination = null
          npc.wanderCooldown = 1000
          return true
        }
      }
      npc.destination = null
      return false
    }
    moveToward(npc, dest.exitX, dest.exitY, world, hash, playerX, playerY)
    npc.wanderCooldown = 150 + Math.random() * 200
    return false
  }

  return false
}

function transferEntity(entity, fromWorld, toWorld, newX, newY) {
  const idx = fromWorld.entities.list.indexOf(entity)
  if (idx !== -1) fromWorld.entities.list.splice(idx, 1)
  if (fromWorld.spatialHash) fromWorld.spatialHash.remove(entity)

  entity.x = newX
  entity.y = newY
  toWorld.entities.list.push(entity)
  if (toWorld.spatialHash) toWorld.spatialHash.insert(entity)
}

// ============================================================
// NPC-NPC INTERACTIONS
// ============================================================

function getEffectiveDisposition(npcA, npcB) {
  const rel = getRelation(npcA.id, npcB.id)
  if (rel) return rel.disposition
  return getFactionDisposition(npcA.faction, npcB.faction)
}

function checkInteractions(npc, world, hash, npcById, now) {
  const nearby = hash.getInRect(
    npc.x - INTERACT_RADIUS, npc.y - INTERACT_RADIUS,
    npc.x + INTERACT_RADIUS, npc.y + INTERACT_RADIUS
  )

  for (const other of nearby) {
    if (other.kind !== 'npc' || !other.alive) continue
    if (other.id === npc.id) continue
    if (other.combatState) continue
    if (chebyshev(npc.x, npc.y, other.x, other.y) > INTERACT_RADIUS) continue

    const disp = getEffectiveDisposition(npc, other)

    if (disp === 'hostile' || disp === 'rival') {
      if (npc.aggression > 0.3 + Math.random() * 0.4) {
        npc.combatState = { targetId: other.id, tickCooldown: 300 }
        npc.emote = '!'
        npc.emoteExpiry = now + 2000
        npc.mood = 'irritable'
        addMemory(npc, 'attacked_by', now, { attackerId: other.id, attackerName: other.name })
        return
      }
    } else if (disp === 'friendly' || disp === 'neutral') {
      if (npc.sociability > 0.2 + Math.random() * 0.5) {
        const pauseMs = 2000 + Math.random() * 2000
        npc.wanderCooldown += pauseMs
        npc.interactionCooldown = 8000 + Math.random() * 7000
        npc.emote = '...'
        npc.emoteExpiry = now + 2000
        if (Math.random() < 0.3) npc.mood = 'cheerful'

        other.wanderCooldown += pauseMs
        other.interactionCooldown = 8000 + Math.random() * 7000
        other.emote = '...'
        other.emoteExpiry = now + 2000

        addMemory(npc, 'conversation', now, { withId: other.id, withName: other.name })
        addMemory(other, 'conversation', now, { withId: npc.id, withName: npc.name })

        const rel = getRelation(npc.id, other.id)
        if (rel) {
          setRelation(npc.id, other.id, rel.disposition, Math.min(100, rel.trust + 5))
        }
        return
      }
    }
  }
}

// ============================================================
// MOVEMENT HELPERS
// ============================================================

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

function moveToward(npc, tx, ty, world, hash, playerX, playerY) {
  const tdx = tx - npc.x
  const tdy = ty - npc.y
  if (tdx === 0 && tdy === 0) return false

  let stepX = 0
  let stepY = 0
  if (Math.abs(tdx) >= Math.abs(tdy)) {
    stepX = tdx > 0 ? 1 : -1
  } else {
    stepY = tdy > 0 ? 1 : -1
  }

  let nx = npc.x + stepX
  let ny = npc.y + stepY
  if (canMoveTo(nx, ny, npc, world, hash, playerX, playerY)) {
    npc.x = nx
    npc.y = ny
    return true
  }

  if (stepX !== 0 && tdy !== 0) {
    nx = npc.x; ny = npc.y + (tdy > 0 ? 1 : -1)
  } else if (stepY !== 0 && tdx !== 0) {
    nx = npc.x + (tdx > 0 ? 1 : -1); ny = npc.y
  } else {
    return false
  }

  if (canMoveTo(nx, ny, npc, world, hash, playerX, playerY)) {
    npc.x = nx
    npc.y = ny
    return true
  }
  return false
}

function canMoveTo(nx, ny, entity, world, hash, playerX, playerY) {
  if (isSolid(world, nx, ny)) return false
  if (nx === playerX && ny === playerY) return false
  if (hash.hasEntityAt(nx, ny, entity)) return false
  return true
}

function chebyshev(px, py, ex, ey) {
  return Math.max(Math.abs(px - ex), Math.abs(py - ey))
}

// ============================================================
// PLAYER-FACING FUNCTIONS
// ============================================================

export function entityBlocksTile(world, x, y) {
  if (!world.spatialHash) return false
  return world.spatialHash.hasNpcAt(x, y)
}

export function findInteractTarget(world, playerX, playerY) {
  if (!world.spatialHash) return null
  const nearby = world.spatialHash.getInRect(playerX - 1, playerY - 1, playerX + 1, playerY + 1)

  let npc = null
  let obj = null
  for (const e of nearby) {
    const d = chebyshev(playerX, playerY, e.x, e.y)
    if (e.kind === 'npc' && e.alive) {
      if (d === 1) npc = e
    } else if (e.kind === 'object') {
      if (d <= 1) obj = e
    }
  }
  return npc ?? obj
}
