import { CATALOGUE_PAINTS } from './catalog.ts'
import type { Maker, MakerFilter, Medium, Paint } from './types.ts'

export const PAINTS: Paint[] = CATALOGUE_PAINTS

export const PAINTS_BY_ID = new Map(PAINTS.map((paint) => [paint.id, paint]))

export const DEFAULT_PALETTES: Record<Medium, string[]> = {
  watercolour: [
    'hansa-yellow',
    'yellow-ochre',
    'cadmium-red',
    'alizarin-crimson',
    'quinacridone-rose',
    'burnt-sienna',
    'burnt-umber',
    'ultramarine',
    'cerulean-blue',
    'phthalo-blue',
    'phthalo-green',
    'sap-green',
    'paynes-gray',
  ],
  gouache: [
    'hansa-yellow',
    'yellow-ochre',
    'cadmium-orange',
    'cadmium-red',
    'alizarin-crimson',
    'burnt-sienna',
    'ultramarine',
    'cerulean-blue',
    'phthalo-green',
    'dioxazine-purple',
    'ivory-black',
    'titanium-white',
  ],
  acrylic: [
    'cadmium-yellow',
    'yellow-ochre',
    'cadmium-orange',
    'pyrrole-red',
    'alizarin-crimson',
    'burnt-sienna',
    'burnt-umber',
    'ultramarine',
    'phthalo-blue',
    'phthalo-green',
    'dioxazine-purple',
    'ivory-black',
    'titanium-white',
  ],
  oil: [
    'cadmium-yellow',
    'yellow-ochre',
    'raw-sienna',
    'cadmium-red',
    'alizarin-crimson',
    'burnt-sienna',
    'burnt-umber',
    'ultramarine',
    'cobalt-blue',
    'viridian',
    'ivory-black',
    'titanium-white',
  ],
}

export type PaletteSet = {
  id: string
  name: string
  maker: Maker
  medium: Medium
  ids: string[]
}

export const PALETTE_SETS: PaletteSet[] = [
  {
    id: 'ds-essentials',
    name: 'DS Essentials (6)',
    maker: 'daniel-smith',
    medium: 'watercolour',
    ids: [
      'ds-hansa-yellow-light',
      'ds-new-gamboge',
      'ds-quinacridone-rose',
      'ds-pyrrol-scarlet',
      'ds-phthalo-blue-gs',
      'ds-french-ultramarine',
    ],
  },
  {
    id: 'ds-ultimate-mixing',
    name: 'DS Ultimate Mixing (15)',
    maker: 'daniel-smith',
    medium: 'watercolour',
    ids: [
      'ds-buff-titanium',
      'ds-hansa-yellow-medium',
      'ds-quinacridone-gold',
      'ds-pyrrol-scarlet',
      'ds-permanent-alizarin-crimson',
      'ds-quinacridone-rose',
      'ds-ultramarine-blue',
      'ds-cerulean-blue-chromium',
      'ds-phthalo-blue-gs',
      'ds-phthalo-green-bs',
      'ds-goethite',
      'ds-burnt-sienna',
      'ds-indian-red',
      'ds-raw-umber',
      'ds-janes-grey',
    ],
  },
  {
    id: 'wn-split-primary',
    name: 'W&N split primaries',
    maker: 'winsor-newton',
    medium: 'watercolour',
    ids: [
      'wn-winsor-lemon',
      'wn-winsor-yellow-deep',
      'wn-winsor-red',
      'wn-permanent-rose',
      'wn-french-ultramarine',
      'wn-winsor-blue-gs',
      'wn-burnt-sienna',
      'wn-yellow-ochre',
    ],
  },
]

export function paintsForMedium(medium: Medium, extra: Paint[] = []): Paint[] {
  return [...PAINTS, ...extra].filter((paint) => paint.mediums.includes(medium))
}

export function mixPaintIds(
  medium: Medium,
  enabledIds: readonly string[],
  maker: MakerFilter,
  extra: Paint[] = [],
): string[] {
  const catalogue = paintsForMedium(medium, extra)
  if (maker === 'all') {
    return enabledIds.filter((id) => catalogue.some((paint) => paint.id === id))
  }
  const makerIds = catalogue.filter((paint) => paint.maker === maker).map((paint) => paint.id)
  const enabledFromMaker = enabledIds.filter((id) => makerIds.includes(id))
  return enabledFromMaker.length > 0 ? enabledFromMaker : makerIds
}

export function defaultEnabledIds(medium: Medium): string[] {
  return [...DEFAULT_PALETTES[medium]]
}

export function paintLookup(extra: Paint[] = []): Map<string, Paint> {
  return new Map([...PAINTS, ...extra].map((paint) => [paint.id, paint]))
}

export function isWhite(paint: Paint): boolean {
  return paint.scattering >= 0.9 || /white/i.test(paint.name)
}
