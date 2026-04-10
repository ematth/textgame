const keys = new Set()
let spacePressedThisFrame = false
let mapToggleThisFrame = false
let buildToggleThisFrame = false
let zoomDelta = 0

let mouseX = -1
let mouseY = -1
let clickX = -1
let clickY = -1
let mouseClickedThisFrame = false
let rightClickX = -1
let rightClickY = -1
let rightClickedThisFrame = false
let mouseDown = false

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
    if (e.code === 'KeyM') {
      mapToggleThisFrame = true
    }
    if (e.code === 'KeyB') {
      buildToggleThisFrame = true
    }
    if (e.key === '+' || e.key === '=') {
      zoomDelta += 1
      e.preventDefault()
    } else if (e.key === '-') {
      zoomDelta -= 1
      e.preventDefault()
    }
    if (e.code === 'Space' || e.code === 'KeyM' || e.code === 'KeyB' || e.code in MOVE) {
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

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  })
  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) mouseDown = true
  })
  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouseDown = false
  })
  window.addEventListener('click', (e) => {
    mouseClickedThisFrame = true
    clickX = e.clientX
    clickY = e.clientY
  })
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    rightClickedThisFrame = true
    rightClickX = e.clientX
    rightClickY = e.clientY
  })
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

/** One-shot: returns true once when M was pressed, then clears. */
export function consumeMapToggle() {
  const m = mapToggleThisFrame
  mapToggleThisFrame = false
  return m
}

/** Returns accumulated zoom step since last consume, then clears. */
export function consumeZoomDelta() {
  const d = zoomDelta
  zoomDelta = 0
  return d
}

/** Current mouse position in CSS pixels. Returns {x: -1, y: -1} before first move. */
export function getMousePos() {
  return { x: mouseX, y: mouseY }
}

/** One-shot: returns click position {x, y} if clicked this frame, else null. */
export function consumeClick() {
  if (!mouseClickedThisFrame) return null
  mouseClickedThisFrame = false
  return { x: clickX, y: clickY }
}

/** One-shot: returns true once when B was pressed, then clears. */
export function consumeBuildToggle() {
  const b = buildToggleThisFrame
  buildToggleThisFrame = false
  return b
}

/** One-shot: returns right-click position {x, y} if right-clicked this frame, else null. */
export function consumeRightClick() {
  if (!rightClickedThisFrame) return null
  rightClickedThisFrame = false
  return { x: rightClickX, y: rightClickY }
}

/** Returns true while left mouse button is held down. */
export function isMouseDown() {
  return mouseDown
}
