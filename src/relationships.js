const relations = new Map()

export function getRelation(fromId, toId) {
  return relations.get(`${fromId}->${toId}`) ?? null
}

export function setRelation(fromId, toId, disposition, trust) {
  relations.set(`${fromId}->${toId}`, { disposition, trust })
}

export function removeRelation(fromId, toId) {
  relations.delete(`${fromId}->${toId}`)
}

export function clearRelationsFor(npcId) {
  const toDelete = []
  for (const key of relations.keys()) {
    if (key.startsWith(`${npcId}->`) || key.endsWith(`->${npcId}`)) {
      toDelete.push(key)
    }
  }
  for (const key of toDelete) relations.delete(key)
}

export function getRelationCount() {
  return relations.size
}
