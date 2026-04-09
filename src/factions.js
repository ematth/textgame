export const FACTIONS = {
  city_watch:     { name: 'City Watch',     roles: ['Guard', 'Soldier', 'Knight'] },
  merchant_guild: { name: 'Merchant Guild', roles: ['Merchant', 'Baker', 'Fishmonger', 'Innkeeper', 'Blacksmith'] },
  thieves_guild:  { name: 'Thieves Guild',  roles: ['Thief', 'Beggar'] },
  temple_order:   { name: 'Temple Order',   roles: ['Priest', 'Healer', 'Scholar'] },
  nobility:       { name: 'Nobility',       roles: ['Noble', 'Servant'] },
  commoners:      { name: 'Commoners',      roles: ['Farmer', 'Mason', 'Courier', 'Bard', 'Witch'] },
}

const ROLE_TO_FACTION = {}
for (const [factionId, faction] of Object.entries(FACTIONS)) {
  for (const role of faction.roles) {
    if (!ROLE_TO_FACTION[role]) ROLE_TO_FACTION[role] = factionId
  }
}

export { ROLE_TO_FACTION }

const FACTION_DISPOSITIONS = {
  'city_watch->thieves_guild': 'hostile',
  'thieves_guild->city_watch': 'hostile',
  'city_watch->nobility': 'friendly',
  'nobility->city_watch': 'friendly',
  'city_watch->merchant_guild': 'friendly',
  'merchant_guild->city_watch': 'friendly',
  'thieves_guild->merchant_guild': 'rival',
  'merchant_guild->thieves_guild': 'hostile',
  'temple_order->thieves_guild': 'rival',
  'thieves_guild->temple_order': 'rival',
  'nobility->commoners': 'neutral',
  'commoners->nobility': 'rival',
  'temple_order->nobility': 'neutral',
  'nobility->temple_order': 'friendly',
  'city_watch->commoners': 'neutral',
  'commoners->city_watch': 'neutral',
  'temple_order->commoners': 'friendly',
  'commoners->temple_order': 'friendly',
  'merchant_guild->commoners': 'neutral',
  'commoners->merchant_guild': 'friendly',
  'nobility->merchant_guild': 'neutral',
  'merchant_guild->nobility': 'friendly',
  'nobility->thieves_guild': 'hostile',
  'thieves_guild->nobility': 'rival',
}

const CRIMINAL_ROLES = new Set(['Thief', 'Beggar', 'Witch'])

export function isCriminalRole(roleName) {
  return CRIMINAL_ROLES.has(roleName)
}

export function getFactionDisposition(factionA, factionB) {
  if (factionA === factionB) return 'friendly'
  return FACTION_DISPOSITIONS[`${factionA}->${factionB}`] ?? 'neutral'
}

export function getFactionForRole(roleName) {
  return ROLE_TO_FACTION[roleName] ?? 'commoners'
}
