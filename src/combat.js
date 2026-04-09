import { clearRelationsFor } from './relationships.js'

export class DamageQueue {
  constructor() {
    this.pending = []
  }

  enqueue(source, target, amount, type, world) {
    if (!target.alive) return
    this.pending.push({ source, target, amount, type, world })
  }

  processAll(now) {
    const results = []
    for (const entry of this.pending) {
      if (!entry.target.alive) continue
      if (!entry.source.alive) continue
      const result = applyDamage(entry)
      results.push({ ...entry, ...result })
      console.log(
        `[DMG] ${entry.source.name} -> ${entry.target.name}: ${result.damage} ${entry.type} dmg` +
        (result.killed ? ' [FATAL]' : ` (${entry.target.hp}/${entry.target.maxHp} hp)`)
      )
      if (result.killed) {
        killNpc(entry.target, entry.world, `slain by ${entry.source.name}`, now)
      }
    }
    this.pending = []
    return results
  }
}

function applyDamage({ source, target, amount }) {
  const totalAtk = amount + (source.equipment?.weapon?.attackBonus ?? 0)
  const totalDef = target.defense + (target.equipment?.armor?.defenseBonus ?? 0)
    + (target.equipment?.shield?.defenseBonus ?? 0)
  const damage = Math.max(1, totalAtk - totalDef + Math.floor(Math.random() * 4) - 1)
  target.hp -= damage
  return { damage, killed: target.hp <= 0 }
}

export function killNpc(npc, world, reason, now) {
  npc.alive = false
  npc.combatState = null
  console.log(`[DEATH] ${npc.name} (${npc.race} ${npc.role}) killed — ${reason}`)

  const idx = world.entities.list.indexOf(npc)
  if (idx !== -1) world.entities.list.splice(idx, 1)
  if (world.spatialHash) world.spatialHash.remove(npc)

  clearRelationsFor(npc.id)

  const corpse = {
    kind: 'object',
    id: `corpse_${npc.id}`,
    x: npc.x,
    y: npc.y,
    char: '%',
    fg: '#8b0000',
    bg: null,
    label: `Corpse of ${npc.name}`,
    dialog: `The remains of ${npc.name}, a ${npc.race} ${npc.role}.`,
    decayAt: now + 60_000,
    isCorpse: true,
  }
  world.entities.list.push(corpse)
  if (world.spatialHash) world.spatialHash.insert(corpse)

  notifyWitnesses(npc, world, corpse, now)

  return corpse
}

function notifyWitnesses(deadNpc, world, corpse, now) {
  if (!world.spatialHash) return
  const nearby = world.spatialHash.getInRect(
    deadNpc.x - 5, deadNpc.y - 5,
    deadNpc.x + 5, deadNpc.y + 5
  )
  for (const e of nearby) {
    if (e.kind !== 'npc' || !e.alive) continue
    addMemory(e, 'witnessed_death', now, { victimName: deadNpc.name, victimId: deadNpc.id })
    e.mood = 'anxious'
    if (e.sociability > e.aggression) {
      e.fleeState = { fromX: deadNpc.x, fromY: deadNpc.y, until: now + 5000 }
    }
    if (['Guard', 'Soldier', 'Knight'].includes(e.role)) {
      e.mood = 'suspicious'
      e.wanderCooldown = Math.min(e.wanderCooldown, 100)
    }
  }
}

export function addMemory(npc, type, timestamp, detail) {
  if (!npc.memory) npc.memory = []
  npc.memory.push({ type, timestamp, detail })
  if (npc.memory.length > 10) npc.memory.shift()
}

export function decayCorpses(world, now) {
  const list = world.entities.list
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i]
    if (e.isCorpse && e.decayAt && now >= e.decayAt) {
      list.splice(i, 1)
      if (world.spatialHash) world.spatialHash.remove(e)
    }
  }
}
