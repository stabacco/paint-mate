import type { MakerFilter, Medium, Paint } from './color/types.ts'

const STORAGE_KEY = 'paint-mate.v2'
const LEGACY_KEY = 'paint-mate.v1'

export type PersistedState = {
  medium: Medium
  targetHex: string
  enabled: Partial<Record<Medium, string[]>>
  customPaints: Paint[]
  maker: MakerFilter
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (!parsed || typeof parsed.targetHex !== 'string') return null
    return {
      medium: parsed.medium ?? 'watercolour',
      targetHex: parsed.targetHex,
      enabled: parsed.enabled ?? {},
      customPaints: Array.isArray(parsed.customPaints) ? parsed.customPaints : [],
      maker: parsed.maker ?? 'all',
    }
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

export function createCustomPaint(input: {
  name: string
  hex: string
  pigment?: string
  medium: Medium
}): Paint {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return {
    id: `custom-${slug || 'colour'}-${Date.now().toString(36)}`,
    name: input.name.trim() || 'Untitled',
    pigment: input.pigment?.trim() || 'custom',
    hex: input.hex,
    opacity: 'semi',
    scattering: 0.48,
    mediums: [input.medium],
    maker: 'custom',
  }
}
