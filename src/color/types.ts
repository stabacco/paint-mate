export const MEDIUMS = ['watercolour', 'gouache', 'acrylic', 'oil'] as const

export type Medium = (typeof MEDIUMS)[number]

export const MAKERS = ['daniel-smith', 'winsor-newton', 'studio', 'custom'] as const

export type Maker = (typeof MAKERS)[number]

export type MakerFilter = Maker | 'all'

export type Opacity = 'transparent' | 'semi' | 'opaque'

export type Paint = {
  id: string
  name: string
  pigment: string
  hex: string
  opacity: Opacity
  scattering: number
  mediums: Medium[]
  maker: Maker
}

export type MixPart = {
  paintId: string
  weight: number
}

export type Recipe = {
  parts: MixPart[]
  water: number
  mixedHex: string
  deltaE: number
}

export type Rgb = readonly [number, number, number]

export type OkLab = {
  L: number
  a: number
  b: number
}

export const MAKER_LABELS: Record<Maker, string> = {
  'daniel-smith': 'Daniel Smith',
  'winsor-newton': 'Winsor & Newton',
  studio: 'Studio staples',
  custom: 'My colours',
}

export const MAKER_SHOPS: Partial<Record<Maker, { label: string; url: string }>> = {
  'daniel-smith': {
    label: 'Senior Art Supplies',
    url: 'https://seniorart.com.au/pages/daniel-smith',
  },
  'winsor-newton': {
    label: 'Senior Art Supplies',
    url: 'https://seniorart.com.au/pages/winsor-newton',
  },
}
