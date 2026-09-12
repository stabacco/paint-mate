import type { Medium } from './color/types.ts'

const STORAGE_KEY = 'paint-mate.v1'

export type PersistedState = {
  medium: Medium
  targetHex: string
  enabled: Partial<Record<Medium, string[]>>
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed || typeof parsed.targetHex !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota / private-mode failures.
  }
}
