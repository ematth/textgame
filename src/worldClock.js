const DAY_LENGTH_MS = 300_000

let elapsed = 30_000

export function tickClock(dtMs) {
  elapsed += dtMs
}

export function getElapsed() {
  return elapsed
}

export function getHour() {
  return ((elapsed % DAY_LENGTH_MS) / DAY_LENGTH_MS) * 24
}

export function isDaytime() {
  const h = getHour()
  return h >= 6 && h < 20
}

/**
 * Returns night overlay opacity: 0.0 (full day) to 0.35 (full night).
 * Smooth ramp during dawn (5–7) and dusk (19–21).
 */
export function getNightDarkness() {
  const h = getHour()
  if (h >= 7 && h < 19) return 0.0
  if (h >= 21 || h < 5) return 0.35
  if (h >= 5 && h < 7) return 0.35 * (1 - (h - 5) / 2)
  /* 19..21 */ return 0.35 * ((h - 19) / 2)
}

export function getPhase() {
  const h = getHour()
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 14) return 'midday'
  if (h >= 14 && h < 20) return 'afternoon'
  return 'night'
}

export function getTimeString() {
  const h = getHour()
  const hours = Math.floor(h)
  const mins = Math.floor((h - hours) * 60)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

const NIGHT_ROLES = new Set(['Guard', 'Soldier', 'Thief', 'Witch', 'Knight'])

export function isNightActiveRole(roleName) {
  return NIGHT_ROLES.has(roleName)
}

export function getScheduleForPhase(phase, role) {
  if (phase === 'night') {
    return isNightActiveRole(role) ? 'work' : 'sleep'
  }
  if (phase === 'midday') return 'eat'
  return 'work'
}
