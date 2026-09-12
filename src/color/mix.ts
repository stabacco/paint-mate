import { hexToRgb, rgbToLinear } from './convert.ts'
import { mixToHex, PAPER_SPECTRUM, linearRgbToSpectrum } from './spectral.ts'
import type { MixPart, Paint, Recipe } from './types.ts'

export type MixablePaint = Paint & {
  spectrum: number[]
}

export function resolvePaint(paint: Paint): MixablePaint {
  return {
    ...paint,
    spectrum: linearRgbToSpectrum(rgbToLinear(hexToRgb(paint.hex))),
  }
}

export function mixPaints(
  paints: readonly MixablePaint[],
  weights: readonly number[],
  water = 0,
): string {
  const pigmentTotal = Math.max(1 - water, 0)
  const items = paints.map((paint, index) => ({
    spectrum: paint.spectrum,
    scattering: paint.scattering,
    weight: (weights[index] ?? 0) * pigmentTotal,
  }))
  if (water > 0.001) {
    items.push({
      spectrum: PAPER_SPECTRUM,
      scattering: 1,
      weight: water,
    })
  }
  return mixToHex(items)
}

export function recipeFromParts(
  paintsById: ReadonlyMap<string, MixablePaint>,
  parts: MixPart[],
  water: number,
): Omit<Recipe, 'deltaE'> {
  const resolved = parts.map((part) => {
    const paint = paintsById.get(part.paintId)
    if (!paint) {
      throw new Error(`Unknown paint: ${part.paintId}`)
    }
    return paint
  })
  return {
    parts,
    water,
    mixedHex: mixPaints(
      resolved,
      parts.map((part) => part.weight),
      water,
    ),
  }
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const next = x % y
    x = y
    y = next
  }
  return x || 1
}

export function toPercents(weights: readonly number[]): number[] {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  if (total <= 0) return weights.map(() => 0)
  const raw = weights.map((weight) => (weight / total) * 100)
  const floors = raw.map((value) => Math.floor(value))
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0)
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction)
  for (const item of order) {
    if (remainder <= 0) break
    floors[item.index] += 1
    remainder -= 1
  }
  return floors
}

export function toPartsRatio(percents: readonly number[]): number[] {
  const values = percents.filter((value) => value > 0)
  if (values.length === 0) return []
  const divisor = values.reduce((acc, value) => gcd(acc, value), values[0])
  return percents.map((value) => value / divisor)
}

export function describeWash(water: number): string | null {
  if (water < 0.12) return null
  if (water < 0.28) return 'a creamy, slightly thinned mix'
  if (water < 0.5) return 'a medium wash'
  return 'a pale, watery wash'
}
