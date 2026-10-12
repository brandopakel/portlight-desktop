import { useSyncExternalStore } from 'react'
import { games } from './catalog'

const KEY = 'portlight:wishlist'
const listeners = new Set<() => void>()

const read = (): string[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    const ids = new Set(games.map(g => g.id))
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string' && ids.has(id)) : []
  } catch {
    return []
  }
}

let snapshot = read()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const toggleWishlist = (id: string) => {
  snapshot = snapshot.includes(id) ? snapshot.filter((x) => x !== id) : [...snapshot, id]
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot))
  } catch {
    // modo privado: a lista vive só na sessão
  }
  listeners.forEach((l) => l())
}

export const useWishlist = () => useSyncExternalStore(subscribe, () => snapshot)
