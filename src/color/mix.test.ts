import { describe, expect, it } from 'vitest'
import { hexToRgb, hexToOklab, normaliseHex, rgbToHex } from './convert.ts'
import { mixPaints, resolvePaint, toPartsRatio, toPercents } from './mix.ts'
import { PAINTS_BY_ID } from './palettes.ts'
import { findRecipes } from './solve.ts'
import { mixToHex } from './spectral.ts'

function paint(id: string) {
  const found = PAINTS_BY_ID.get(id)
  if (!found) throw new Error(id)
  return resolvePaint(found)
}

describe('convert', () => {
  it('round-trips hex colours', () => {
    expect(rgbToHex(hexToRgb('#8F4B2E'))).toBe('#8F4B2E')
    expect(normaliseHex('9b1')).toBe('#99BB11')
  })

  it('places red and green in different OKLab hues', () => {
    const red = hexToOklab('#E03C28')
    const green = hexToOklab('#0B6B54')
    expect(red.a).toBeGreaterThan(0.1)
    expect(green.a).toBeLessThan(0)
  })
})

describe('painterly mixing', () => {
  it('mixes yellow and blue toward green, not gray', () => {
    const mixed = mixPaints(
      [paint('cadmium-yellow'), paint('ultramarine')],
      [0.55, 0.45],
    )
    const lab = hexToOklab(mixed)
    const hue = ((Math.atan2(lab.b, lab.a) * 180) / Math.PI + 360) % 360
    expect(hue).toBeGreaterThan(80)
    expect(hue).toBeLessThan(180)
    expect(lab.a).toBeLessThan(0.05)
  })

  it('mixes red and yellow toward orange', () => {
    const mixed = mixPaints(
      [paint('cadmium-red'), paint('cadmium-yellow')],
      [0.45, 0.55],
    )
    const lab = hexToOklab(mixed)
    const hue = ((Math.atan2(lab.b, lab.a) * 180) / Math.PI + 360) % 360
    expect(hue).toBeGreaterThan(25)
    expect(hue).toBeLessThan(90)
  })

  it('thins a watercolour toward paper, lifting value', () => {
    const masstone = mixPaints([paint('alizarin-crimson')], [1], 0)
    const wash = mixPaints([paint('alizarin-crimson')], [1], 0.6)
    expect(hexToOklab(wash).L).toBeGreaterThan(hexToOklab(masstone).L)
  })

  it('keeps a single paint close to its tube colour', () => {
    const burnt = paint('burnt-sienna')
    const mixed = mixToHex([
      { spectrum: burnt.spectrum, scattering: burnt.scattering, weight: 1 },
    ])
    const distance = Math.abs(hexToOklab(mixed).L - hexToOklab(burnt.hex).L)
    expect(distance).toBeLessThan(0.12)
  })
})

describe('solver', () => {
  it('returns the tube colour when the target is already on the palette', () => {
    const recipes = findRecipes('#8F4B2E', ['burnt-sienna', 'ultramarine', 'hansa-yellow'], 'watercolour')
    expect(recipes[0]?.parts).toHaveLength(1)
    expect(recipes[0]?.parts[0]?.paintId).toBe('burnt-sienna')
    expect(recipes[0]?.deltaE).toBeLessThan(8)
  })

  it('suggests burnt sienna and a crimson for a warm red-brown', () => {
    const recipes = findRecipes(
      '#A24A3A',
      ['burnt-sienna', 'alizarin-crimson', 'ultramarine', 'hansa-yellow', 'titanium-white'],
      'acrylic',
    )
    const ids = new Set(recipes[0]?.parts.map((part) => part.paintId))
    expect(ids.has('burnt-sienna') || ids.has('alizarin-crimson')).toBe(true)
    expect(recipes[0]?.deltaE).toBeLessThan(12)
  })

  it('formats ratios that sum to 100', () => {
    expect(toPercents([0.6, 0.4]).reduce((a, b) => a + b, 0)).toBe(100)
    expect(toPartsRatio([60, 40])).toEqual([3, 2])
  })
})
