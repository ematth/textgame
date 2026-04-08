const keys = new Set()
let spacePressedThisFrame = false

const ARROW = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys.add(e.code)
    if (e.code === 'Space') {
      spacePressedThisFrame = true
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault()
    }
  })
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code)
  })
}

/** @returns {{ dx: number, dy: number } | null} */
export function getDirection() {
  let dx = 0
  let dy = 0
  for (const [code, [cdx, cdy]] of Object.entries(ARROW)) {
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
