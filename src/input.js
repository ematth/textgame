const keys = new Set()
let spacePressedThisFrame = false
let zoomDelta = 0

const MOVE = {
  KeyW: [0, -1],
  KeyS: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
}

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys.add(e.code)
    if (e.code === 'Space') {
      spacePressedThisFrame = true
    }
    if (e.key === '+' || e.key === '=') {
      zoomDelta += 1
      e.preventDefault()
    } else if (e.key === '-') {
      zoomDelta -= 1
      e.preventDefault()
    }
    if (e.code === 'Space' || e.code in MOVE) {
      e.preventDefault()
    }
  })
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code)
  })
  window.addEventListener('wheel', (e) => {
    if (e.deltaY < 0) zoomDelta += 1
    else if (e.deltaY > 0) zoomDelta -= 1
    e.preventDefault()
  }, { passive: false })
}

/** @returns {{ dx: number, dy: number } | null} */
export function getDirection() {
  let dx = 0
  let dy = 0
  for (const [code, [cdx, cdy]] of Object.entries(MOVE)) {
    if (keys.has(code)) {
      dx += cdx
      dy += cdy
    }
  }
  if (dx === 0 && dy === 0) return null
  if (dx !== 0 && dy !== 0) {
    dx = Math.sign(dx)
    dy = Math.sign(dy)
  } else {
    dx = Math.sign(dx)
    dy = Math.sign(dy)
  }
  return { dx, dy }
}

export function isSpaceDown() {
  return keys.has('Space')
}

/** One-shot per frame: first read returns true, then clears until next keydown. */
export function consumeSpacePress() {
  const s = spacePressedThisFrame
  spacePressedThisFrame = false
  return s
}

/** Returns accumulated zoom step since last consume, then clears. */
export function consumeZoomDelta() {
  const d = zoomDelta
  zoomDelta = 0
  return d
}
