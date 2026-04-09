const HUNGER_RATE = 1 / 30_000
const THIRST_RATE = 1 / 20_000
const REST_RATE   = 1 / 45_000

const HUNGER_SEEK = 70
const THIRST_SEEK = 60
const REST_SEEK   = 75

const HUNGER_PENALTY = 90
const THIRST_PENALTY = 85
const REST_PENALTY   = 95

export function updateNeeds(npc, dtMs) {
  npc.hunger = Math.min(100, npc.hunger + dtMs * HUNGER_RATE)
  npc.thirst = Math.min(100, npc.thirst + dtMs * THIRST_RATE)
  npc.rest   = Math.min(100, npc.rest   + dtMs * REST_RATE)
}

export function needsPenalty(npc) {
  let atkPen = 0
  let defPen = 0
  let cooldownMult = 1.0
  if (npc.hunger >= HUNGER_PENALTY) { atkPen += 2 }
  if (npc.thirst >= THIRST_PENALTY) { cooldownMult *= 1.5 }
  if (npc.rest >= REST_PENALTY) {
    atkPen += 3; defPen += 3
    cooldownMult *= 1.3
  }
  return { atkPen, defPen, cooldownMult }
}

export function getUrgentNeed(npc) {
  if (npc.rest >= REST_SEEK)     return 'rest'
  if (npc.thirst >= THIRST_SEEK) return 'thirst'
  if (npc.hunger >= HUNGER_SEEK) return 'hunger'
  return null
}

export function satisfyNeed(npc, needType) {
  switch (needType) {
    case 'hunger':
      npc.hunger = 0
      npc.thirst = Math.max(0, npc.thirst - 30)
      break
    case 'thirst':
      npc.thirst = 0
      break
    case 'rest':
      npc.rest = 0
      break
  }
}

export function needsTargetBuildingType(needType) {
  switch (needType) {
    case 'hunger': return ['tavern', 'shop']
    case 'thirst': return ['tavern']
    case 'rest':   return ['house', 'noble_house']
    default: return []
  }
}
