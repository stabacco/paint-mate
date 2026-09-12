import { describe, expect, it } from 'vitest'
import { extractImageColours } from './extract.ts'
import { PAINTS_BY_ID } from './palettes.ts'
import { suggestPaintsForColours } from './suggest.ts'

function fillRect(
  pixels: Uint8ClampedArray,
  width: number,
  x0: number,
  x1: number,
  rgb: [number, number, number],
): void {
  for (let y = 0; y < 8; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * 4
      pixels[i] = rgb[0]
      pixels[i + 1] = rgb[1]
      pixels[i + 2] = rgb[2]
      pixels[i + 3] = 255
    }
  }
}

describe('extractImageColours', () => {
  it('finds distinct red and blue regions', () => {
    const width = 16
    const pixels = new Uint8ClampedArray(width * 8 * 4)
    fillRect(pixels, width, 0, 8, [210, 40, 36])
    fillRect(pixels, width, 8, 16, [40, 70, 170])
    const colours = extractImageColours(pixels, { count: 4 })
    expect(colours.length).toBeGreaterThanOrEqual(2)
    const joined = colours.join(' ')
    expect(joined).toMatch(/#D|#E|#C/)
    expect(joined).toMatch(/#2|#3|#4/)
  })

  it('skips the letterbox frame colour', () => {
    const width = 16
    const pixels = new Uint8ClampedArray(width * 8 * 4)
    fillRect(pixels, width, 0, 12, [34, 28, 24])
    fillRect(pixels, width, 12, 16, [210, 40, 36])
    const colours = extractImageColours(pixels, { count: 4, ignoreHex: '#221C18' })
    expect(colours.length).toBe(1)
    expect(colours[0]).toMatch(/#D|#E|#C/)
  })

  it('caps the number of returned colours', () => {
    const width = 24
    const pixels = new Uint8ClampedArray(width * 8 * 4)
    const bands: [number, number, number][] = [
      [210, 40, 36],
      [40, 70, 170],
      [40, 160, 70],
      [230, 190, 40],
      [120, 50, 160],
      [240, 120, 40],
    ]
    const band = width / bands.length
    bands.forEach((rgb, index) => {
      fillRect(pixels, width, Math.round(index * band), Math.round((index + 1) * band), rgb)
    })
    expect(extractImageColours(pixels, { count: 3 })).toHaveLength(3)
  })
})

describe('suggestPaintsForColours', () => {
  it('selects burnt sienna from the studio catalogue for a warm earth', () => {
    const ids = suggestPaintsForColours(['#8F4B2E'], 'watercolour', 'studio')
    expect(ids).toContain('burnt-sienna')
  })

  it('stays inside the chosen maker', () => {
    const ids = suggestPaintsForColours(['#C13B6A', '#3D4F9F'], 'watercolour', 'daniel-smith')
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => id.startsWith('ds-'))).toBe(true)
  })

  it('stays inside Winsor & Newton when that maker is selected', () => {
    const ids = suggestPaintsForColours(['#C13B6A', '#3D4F9F'], 'watercolour', 'winsor-newton')
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => id.startsWith('wn-'))).toBe(true)
  })

  it('returns no tubes when there are no colours', () => {
    expect(suggestPaintsForColours([], 'watercolour', 'all')).toEqual([])
  })

  it('only returns paints that exist for the medium', () => {
    const ids = suggestPaintsForColours(['#2A4A8A', '#C9A227', '#9C3B28'], 'watercolour', 'all')
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      const paint = PAINTS_BY_ID.get(id)
      expect(paint?.mediums).toContain('watercolour')
    }
  })
})
