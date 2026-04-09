const CELL_SIZE = 16

function cellKey(cx, cy) {
  return (cx & 0xffff) | ((cy & 0xffff) << 16)
}

export function createSpatialHash() {
  /** @type {Map<number, Set<any>>} */
  const cells = new Map()
  /** @type {Map<string, number>} entity id -> cell key */
  const entityCell = new Map()

  function _cellCoords(x, y) {
    return { cx: (x / CELL_SIZE) | 0, cy: (y / CELL_SIZE) | 0 }
  }

  function insert(entity) {
    const { cx, cy } = _cellCoords(entity.x, entity.y)
    const key = cellKey(cx, cy)
    let bucket = cells.get(key)
    if (!bucket) {
      bucket = new Set()
      cells.set(key, bucket)
    }
    bucket.add(entity)
    entityCell.set(entity.id, key)
  }

  function remove(entity) {
    const key = entityCell.get(entity.id)
    if (key === undefined) return
    const bucket = cells.get(key)
    if (bucket) {
      bucket.delete(entity)
      if (bucket.size === 0) cells.delete(key)
    }
    entityCell.delete(entity.id)
  }

  function move(entity, oldX, oldY) {
    const oldC = _cellCoords(oldX, oldY)
    const newC = _cellCoords(entity.x, entity.y)
    const oldKey = cellKey(oldC.cx, oldC.cy)
    const newKey = cellKey(newC.cx, newC.cy)
    if (oldKey === newKey) return
    const oldBucket = cells.get(oldKey)
    if (oldBucket) {
      oldBucket.delete(entity)
      if (oldBucket.size === 0) cells.delete(oldKey)
    }
    let newBucket = cells.get(newKey)
    if (!newBucket) {
      newBucket = new Set()
      cells.set(newKey, newBucket)
    }
    newBucket.add(entity)
    entityCell.set(entity.id, newKey)
  }

  function getAt(x, y) {
    const { cx, cy } = _cellCoords(x, y)
    const bucket = cells.get(cellKey(cx, cy))
    if (!bucket) return []
    const result = []
    for (const e of bucket) {
      if (e.x === x && e.y === y) result.push(e)
    }
    return result
  }

  function getInRect(x0, y0, x1, y1) {
    const cx0 = (x0 / CELL_SIZE) | 0
    const cy0 = (y0 / CELL_SIZE) | 0
    const cx1 = (x1 / CELL_SIZE) | 0
    const cy1 = (y1 / CELL_SIZE) | 0
    const result = []
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        const bucket = cells.get(cellKey(cx, cy))
        if (!bucket) continue
        for (const e of bucket) {
          if (e.x >= x0 && e.x <= x1 && e.y >= y0 && e.y <= y1) {
            result.push(e)
          }
        }
      }
    }
    return result
  }

  function hasNpcAt(x, y) {
    const { cx, cy } = _cellCoords(x, y)
    const bucket = cells.get(cellKey(cx, cy))
    if (!bucket) return false
    for (const e of bucket) {
      if (e.kind === 'npc' && e.x === x && e.y === y) return true
    }
    return false
  }

  function hasEntityAt(x, y, except) {
    const { cx, cy } = _cellCoords(x, y)
    const bucket = cells.get(cellKey(cx, cy))
    if (!bucket) return false
    for (const e of bucket) {
      if (e === except) continue
      if (e.x === x && e.y === y) return true
    }
    return false
  }

  return { insert, remove, move, getAt, getInRect, hasNpcAt, hasEntityAt }
}

export function buildSpatialHash(entityList) {
  const hash = createSpatialHash()
  for (const e of entityList) {
    hash.insert(e)
  }
  return hash
}
