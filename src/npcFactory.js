import { isSolid, getTile } from './world.js'
import { TILE } from './tiles.js'
import {
  RACES, RACE_CUM_WEIGHTS, SURNAMES, ROLES, DIALOG, ROUTE_OFFSETS,
  MOODS, COMBAT_STATS, EQUIPMENT_TABLES, PERSONALITY_BASES,
  RACE_PHYSICALS, ROLE_AGE_RANGES, BACKSTORY_TEMPLATES,
} from './npcData.js'
import { getFactionForRole, getFactionDisposition } from './factions.js'
import { setRelation } from './relationships.js'

// --- Seeded PRNG ---
function mulberry32(seed) {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================================
// HELPERS
// ============================================================

function findWalkable(world, x, y, rng, radius) {
  if (!isSolid(world, x, y)) return { x, y }
  for (let r = 1; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < world.width && ny >= 0 && ny < world.height && !isSolid(world, nx, ny)) {
          return { x: nx, y: ny }
        }
      }
    }
  }
  return { x, y }
}

function pickRace(rng) {
  const r = rng()
  for (let i = 0; i < RACE_CUM_WEIGHTS.length; i++) {
    if (r < RACE_CUM_WEIGHTS[i]) return RACES[i]
  }
  return RACES[0]
}

const clamp01 = (v) => Math.max(0, Math.min(1, v))

// ============================================================
// MAIN POPULATION FUNCTION
// ============================================================

export function populateNPCs(worldManager, districtMap, buildingRegistry) {
  const rng = mulberry32(12345)
  const overworld = worldManager.getWorld('overworld')
  if (!overworld) return

  const usedNames = new Set()
  let npcId = 0

  function generateName(race, gender) {
    const names = gender === 'male' ? race.maleNames : race.femaleNames
    for (let attempts = 0; attempts < 100; attempts++) {
      const first = names[(rng() * names.length) | 0]
      const last = SURNAMES[(rng() * SURNAMES.length) | 0]
      const full = `${first} ${last}`
      if (!usedNames.has(full)) {
        usedNames.add(full)
        return full
      }
    }
    const first = names[(rng() * names.length) | 0]
    const last = SURNAMES[(rng() * SURNAMES.length) | 0]
    return `${first} ${last} the ${++npcId}`
  }

  function pickRole(district) {
    const matching = ROLES.filter((r) => r.districts.includes(district))
    if (matching.length > 0 && rng() < 0.7) {
      return matching[(rng() * matching.length) | 0]
    }
    return ROLES[(rng() * ROLES.length) | 0]
  }

  function pickDialog(roleName) {
    const pool = DIALOG[roleName]
    if (!pool || pool.length === 0) return 'I have nothing to say.'
    return pool[(rng() * pool.length) | 0]
  }

  function pickBackstory(roleName) {
    const pool = BACKSTORY_TEMPLATES[roleName]
    if (!pool || pool.length === 0) return ''
    return pool[(rng() * pool.length) | 0]
  }

  function makeRoute(spawnX, spawnY, world) {
    const template = ROUTE_OFFSETS[(rng() * ROUTE_OFFSETS.length) | 0]
    const waypoints = []
    for (const off of template) {
      let wx = spawnX + off.dx
      let wy = spawnY + off.dy
      wx = Math.max(1, Math.min(world.width - 2, wx))
      wy = Math.max(1, Math.min(world.height - 2, wy))
      const pos = findWalkable(world, wx, wy, rng, 5)
      waypoints.push({ x: pos.x, y: pos.y })
    }
    return { waypoints, currentIndex: 0 }
  }

  function createNpc(sx, sy, role, race, world, withRoute, district) {
    const char = race.chars[role.name] || role.name[0]
    const route = withRoute ? makeRoute(sx, sy, world) : null
    const gender = rng() < 0.5 ? 'male' : 'female'

    const stats = COMBAT_STATS[role.name] || { maxHp: 20, attack: 3, defense: 2 }
    const equip = EQUIPMENT_TABLES[role.name] || { weapon: null, armor: null, shield: null }
    const pBase = PERSONALITY_BASES[role.name] || { bravery: 0.5, sociability: 0.5, aggression: 0.3, greed: 0.3, loyalty: 0.5 }
    const ageRange = ROLE_AGE_RANGES[role.name] || [18, 60]
    const phys = RACE_PHYSICALS[race.name] || RACE_PHYSICALS.Human
    const pVar = 0.15

    return {
      id: `npc_${npcId++}`,
      kind: 'npc',
      x: sx,
      y: sy,
      char,
      fg: role.fg,
      name: generateName(race, gender),
      role: role.name,
      race: race.name,
      dialog: pickDialog(role.name),
      wanderCooldown: rng() * 2000,
      route,

      gender,
      age: ageRange[0] + ((rng() * (ageRange[1] - ageRange[0])) | 0),
      height: Math.round(phys.heightBase + (rng() - 0.5) * 2 * phys.heightVar),
      weight: Math.round(phys.weightBase + (rng() - 0.5) * 2 * phys.weightVar),
      backstory: pickBackstory(role.name),
      mood: MOODS[(rng() * MOODS.length) | 0],

      hp: stats.maxHp,
      maxHp: stats.maxHp,
      attack: stats.attack,
      defense: stats.defense,
      alive: true,

      equipment: {
        weapon: equip.weapon ? { ...equip.weapon } : null,
        armor: equip.armor ? { ...equip.armor } : null,
        shield: equip.shield ? { ...equip.shield } : null,
      },

      bravery:     clamp01(pBase.bravery     + (rng() - 0.5) * 2 * pVar),
      sociability: clamp01(pBase.sociability + (rng() - 0.5) * 2 * pVar),
      aggression:  clamp01(pBase.aggression  + (rng() - 0.5) * 2 * pVar),
      greed:       clamp01(pBase.greed       + (rng() - 0.5) * 2 * pVar),
      loyalty:     clamp01(pBase.loyalty     + (rng() - 0.5) * 2 * pVar),

      hunger: rng() * 30,
      thirst: rng() * 20,
      rest: rng() * 25,

      faction: getFactionForRole(role.name),
      memory: [],

      home: null,
      workplace: null,
      schedule: 'work',
      _spawnDistrict: district,

      combatState: null,
      fleeState: null,
      interactionCooldown: 0,
      emote: null,
      emoteExpiry: 0,
      destination: null,
    }
  }

  // --- Overworld NPCs ---
  const OW_COUNT = 4500
  const ow = overworld

  const districtTiles = {}
  for (let d = 0; d <= 5; d++) districtTiles[d] = []

  for (let y = 0; y < ow.height; y++) {
    for (let x = 0; x < ow.width; x++) {
      if (isSolid(ow, x, y)) continue
      const tileId = getTile(ow, x, y)
      if (tileId === TILE.FLOOR || tileId === TILE.DOOR || tileId === TILE.DOOR_INTERIOR) continue
      const d = districtMap[y * ow.width + x]
      if (d <= 5 && districtTiles[d]) {
        districtTiles[d].push(y * ow.width + x)
      }
    }
  }

  const totalTiles = Object.values(districtTiles).reduce((s, a) => s + a.length, 0)
  if (totalTiles === 0) return

  const overworldNpcs = []

  for (let i = 0; i < OW_COUNT; i++) {
    let r = rng() * totalTiles
    let district = 0
    for (let d = 0; d <= 5; d++) {
      r -= districtTiles[d].length
      if (r <= 0) { district = d; break }
    }

    const dTiles = districtTiles[district]
    if (dTiles.length === 0) continue

    const tileIdx = dTiles[(rng() * dTiles.length) | 0]
    const sy = (tileIdx / ow.width) | 0
    const sx = tileIdx - sy * ow.width

    const role = pickRole(district)
    const race = pickRace(rng)
    const useRoute = role.patrol && rng() < 0.7

    const npc = createNpc(sx, sy, role, race, ow, useRoute, district)
    ow.entities.list.push(npc)
    overworldNpcs.push(npc)
  }

  // --- Interior NPCs ---
  const interiorRoles = ROLES.filter((r) => r.interior)
  for (const info of buildingRegistry) {
    if (info.type === 'dungeon') continue
    const intWorld = worldManager.getWorld(`interior_${info.id}`)
    if (!intWorld) continue

    const count = rng() < 0.5 ? 1 : rng() < 0.5 ? 2 : 0
    for (let n = 0; n < count; n++) {
      for (let attempts = 0; attempts < 20; attempts++) {
        const ix = 2 + ((rng() * (intWorld.width - 4)) | 0)
        const iy = 2 + ((rng() * (intWorld.height - 4)) | 0)
        if (!isSolid(intWorld, ix, iy)) {
          let role
          if (info.type === 'shop') role = ROLES.find((r) => r.name === 'Merchant')
          else if (info.type === 'tavern') role = ROLES.find((r) => r.name === 'Innkeeper')
          else if (info.type === 'blacksmith') role = ROLES.find((r) => r.name === 'Blacksmith')
          else if (info.type === 'temple') role = ROLES.find((r) => r.name === 'Priest')
          else if (info.type === 'barracks') role = ROLES.find((r) => r.name === 'Soldier')
          else if (info.type === 'noble_house') role = ROLES.find((r) => r.name === 'Servant')
          else if (info.type === 'castle_throne') role = ROLES.find((r) => r.name === 'Knight')
          else if (info.type === 'castle_chamber') role = ROLES.find((r) => r.name === 'Servant')
          else role = interiorRoles[(rng() * interiorRoles.length) | 0]

          if (!role) role = interiorRoles[(rng() * interiorRoles.length) | 0]

          const race = pickRace(rng)
          intWorld.entities.list.push(createNpc(ix, iy, role, race, intWorld, false, -1))
          break
        }
      }
    }
  }

  // --- Assign homes and workplaces ---
  assignBuildings(overworldNpcs, buildingRegistry, rng)

  // --- Assign initial destinations to some overworld NPCs ---
  assignInitialDestinations(overworldNpcs, buildingRegistry, rng)

  // --- Seed relationships ---
  seedRelationships(overworldNpcs, rng)

  // --- Clean temp fields ---
  for (const npc of overworldNpcs) delete npc._spawnDistrict
}

// ============================================================
// POST-CREATION: BUILDING ASSIGNMENT
// ============================================================

const WORKPLACE_TYPE_MAP = {
  Merchant: ['shop'], Baker: ['shop'], Blacksmith: ['blacksmith'],
  Priest: ['temple'], Healer: ['temple'], Scholar: ['temple'],
  Soldier: ['barracks'], Guard: ['barracks'], Knight: ['barracks'],
  Innkeeper: ['tavern'], Servant: ['noble_house'], Noble: ['noble_house'],
}

function assignBuildings(npcs, buildingRegistry, rng) {
  const byDistrictType = {}
  for (const info of buildingRegistry) {
    if (info.type === 'dungeon') continue
    const key = `${info.district}_${info.type}`
    if (!byDistrictType[key]) byDistrictType[key] = []
    byDistrictType[key].push(info)
  }

  const allHouses = buildingRegistry.filter(b => b.type === 'house' || b.type === 'noble_house')

  for (const npc of npcs) {
    const d = npc._spawnDistrict

    // Home: prefer same-district house, fall back to any house
    const houseKey = `${d}_house`
    const nobleKey = `${d}_noble_house`
    let homes = byDistrictType[houseKey] || byDistrictType[nobleKey] || []
    if (homes.length === 0) homes = allHouses
    if (homes.length > 0) {
      const pick = homes[(rng() * homes.length) | 0]
      npc.home = { buildingId: pick.id, doorX: pick.doorX, doorY: pick.doorY }
    }

    // Workplace
    const wpTypes = WORKPLACE_TYPE_MAP[npc.role]
    if (wpTypes) {
      for (const wt of wpTypes) {
        const key = `${d}_${wt}`
        const cands = byDistrictType[key]
        if (cands && cands.length > 0) {
          const pick = cands[(rng() * cands.length) | 0]
          npc.workplace = { buildingId: pick.id, doorX: pick.doorX, doorY: pick.doorY }
          break
        }
      }
    }
  }
}

// ============================================================
// POST-CREATION: INITIAL DESTINATIONS (~12% of NPCs)
// ============================================================

function assignInitialDestinations(npcs, buildingRegistry, rng) {
  const nonDungeon = buildingRegistry.filter(b => b.type !== 'dungeon')
  if (nonDungeon.length === 0) return

  for (const npc of npcs) {
    if (rng() > 0.12) continue
    const pick = nonDungeon[(rng() * nonDungeon.length) | 0]
    npc.destination = {
      buildingId: pick.id,
      doorX: pick.doorX,
      doorY: pick.doorY,
      state: 'traveling',
      insideTimer: 0,
    }
  }
}

// ============================================================
// POST-CREATION: SEED RELATIONSHIPS
// ============================================================

function seedRelationships(npcs, rng) {
  const len = npcs.length
  if (len < 2) return

  for (let i = 0; i < len; i++) {
    if (rng() > 0.05) continue
    const a = npcs[i]
    const bIdx = (rng() * len) | 0
    if (bIdx === i) continue
    const b = npcs[bIdx]

    const disp = getFactionDisposition(a.faction, b.faction)
    if (disp === 'neutral') continue

    let trust
    if (disp === 'hostile') trust = -80 + ((rng() * 40) | 0)
    else if (disp === 'rival') trust = -40 + ((rng() * 30) | 0)
    else trust = 20 + ((rng() * 30) | 0)

    setRelation(a.id, b.id, disp, trust)

    // 60% chance the feeling is mutual
    if (rng() < 0.6) {
      const reverseDisp = getFactionDisposition(b.faction, a.faction)
      let rTrust
      if (reverseDisp === 'hostile') rTrust = -80 + ((rng() * 40) | 0)
      else if (reverseDisp === 'rival') rTrust = -40 + ((rng() * 30) | 0)
      else rTrust = 20 + ((rng() * 30) | 0)
      setRelation(b.id, a.id, reverseDisp, rTrust)
    }
  }
}
