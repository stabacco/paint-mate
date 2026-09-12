export const MEDIUMS = ['watercolour', 'gouache', 'acrylic', 'oil'] as const

export type Medium = (typeof MEDIUMS)[number]

export type Opacity = 'transparent' | 'semi' | 'opaque'

export type Paint = {
  id: string
  name: string
  pigment: string
  hex: string
  opacity: Opacity
  scattering: number
  mediums: Medium[]
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
