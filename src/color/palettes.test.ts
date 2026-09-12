import { describe, expect, it } from 'vitest'
import { mixPaintIds, paintsForMedium } from './palettes.ts'

describe('maker catalogues', () => {
  it('lists Daniel Smith and Winsor & Newton for every medium', () => {
    for (const medium of ['watercolour', 'gouache', 'acrylic', 'oil'] as const) {
      const paints = paintsForMedium(medium)
      expect(paints.some((paint) => paint.maker === 'daniel-smith')).toBe(true)
      expect(paints.some((paint) => paint.maker === 'winsor-newton')).toBe(true)
    }
  })

  it('mixes Daniel Smith tubes when that maker is selected even if studio defaults are on', () => {
    const ids = mixPaintIds('watercolour', ['burnt-sienna', 'ultramarine'], 'daniel-smith')
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => id.startsWith('ds-'))).toBe(true)
  })

  it('keeps only the enabled Winsor & Newton tubes when some are already on', () => {
    const ids = mixPaintIds(
      'acrylic',
      ['wn-burnt-sienna', 'hansa-yellow', 'wn-french-ultramarine'],
      'winsor-newton',
    )
    expect(ids.sort()).toEqual(['wn-burnt-sienna', 'wn-french-ultramarine'].sort())
  })
})
