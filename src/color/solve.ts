import { hexDeltaE, hexToOklab } from './convert.ts'
import { mixPaints, resolvePaint, toPercents, type MixablePaint } from './mix.ts'
import { PAINTS_BY_ID } from './palettes.ts'
import type { Medium, MixPart, Recipe } from './types.ts'

const TWO_RATIO_STEPS = 19
const WATER_STEPS = [0, 0.12, 0.24, 0.38, 0.52, 0.66]
const WHITE_STEPS = [0, 0.12, 0.24, 0.38, 0.52]

export function findRecipes(
  targetHex: string,
  enabledIds: readonly string[],
  medium: Medium,
  limit = 3,
): Recipe[] {
  const paints = enabledIds
    .map((id) => PAINTS_BY_ID.get(id))
    .filter((paint): paint is NonNullable<typeof paint> => Boolean(paint))
    .filter((paint) => paint.mediums.includes(medium))
    .map(resolvePaint)

  if (paints.length === 0) return []

  const candidates: Recipe[] = []
  const usesWater = medium === 'watercolour'
  const white = paints.find((paint) => paint.id === 'titanium-white' || paint.id === 'chinese-white')
  const chromatic = paints.filter((paint) => paint !== white)

  for (const paint of paints) {
    const waters = usesWater ? WATER_STEPS : [0]
    for (const water of waters) {
      pushCandidate(candidates, targetHex, [paint], [1], water)
    }
    if (white && paint !== white) {
      for (const whiteAmount of WHITE_STEPS.slice(1)) {
        pushCandidate(candidates, targetHex, [paint, white], [1 - whiteAmount, whiteAmount], 0)
      }
    }
  }

  for (let i = 0; i < chromatic.length; i += 1) {
    for (let j = i + 1; j < chromatic.length; j += 1) {
      const a = chromatic[i]
      const b = chromatic[j]
      for (let step = 1; step < TWO_RATIO_STEPS; step += 1) {
        const t = step / TWO_RATIO_STEPS
        const waters = usesWater ? [0, 0.24, 0.46] : [0]
        for (const water of waters) {
          pushCandidate(candidates, targetHex, [a, b], [t, 1 - t], water)
        }
        if (white) {
          for (const whiteAmount of [0.18, 0.36]) {
            const rest = 1 - whiteAmount
            pushCandidate(
              candidates,
              targetHex,
              [a, b, white],
              [t * rest, (1 - t) * rest, whiteAmount],
              0,
            )
          }
        }
      }
    }
  }

  const ranked = uniqueRecipes(candidates).sort(compareRecipes)
  const seeds = ranked.slice(0, 8)

  for (const seed of seeds) {
    const used = new Set(seed.parts.map((part) => part.paintId))
    for (const extra of chromatic) {
      if (used.has(extra.id)) continue
      const seedPaints = seed.parts
        .map((part) => paints.find((paint) => paint.id === part.paintId))
        .filter((paint): paint is MixablePaint => Boolean(paint))
      for (const amount of [0.12, 0.2, 0.32]) {
        const rest = 1 - amount
        pushCandidate(
          candidates,
          targetHex,
          [...seedPaints, extra],
          [...seed.parts.map((part) => part.weight * rest), amount],
          seed.water,
        )
      }
    }
  }

  return uniqueRecipes(candidates).sort(compareRecipes).slice(0, limit)
}

function pushCandidate(
  bucket: Recipe[],
  targetHex: string,
  paints: MixablePaint[],
  weights: number[],
  water: number,
): void {
  const percents = toPercents(weights)
  const kept: { paint: MixablePaint; percent: number }[] = []
  paints.forEach((paint, index) => {
    if (percents[index] >= 4) {
      kept.push({ paint, percent: percents[index] })
    }
  })
  if (kept.length === 0) return
  const total = kept.reduce((sum, item) => sum + item.percent, 0)
  const parts: MixPart[] = kept.map((item) => ({
    paintId: item.paint.id,
    weight: item.percent / total,
  }))
  const mixedHex = mixPaints(
    kept.map((item) => item.paint),
    parts.map((part) => part.weight),
    water,
  )
  bucket.push({
    parts,
    water,
    mixedHex,
    deltaE: hexDeltaE(targetHex, mixedHex),
  })
}

function compareRecipes(a: Recipe, b: Recipe): number {
  const score = (recipe: Recipe) =>
    recipe.deltaE +
    0.85 * Math.max(0, recipe.parts.length - 1) +
    (recipe.water > 0.15 ? 0.12 : 0)
  return score(a) - score(b)
}

function uniqueRecipes(recipes: Recipe[]): Recipe[] {
  const seen = new Set<string>()
  const unique: Recipe[] = []
  for (const recipe of recipes) {
    const key = `${recipe.parts
      .map((part) => `${part.paintId}:${Math.round(part.weight * 20)}`)
      .join('|')}|w${Math.round(recipe.water * 8)}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(recipe)
  }
  return unique
}

export function matchQuality(deltaE: number): {
  label: string
  detail: string
} {
  if (deltaE < 3.2) {
    return { label: 'Excellent match', detail: 'Close enough to use as-is.' }
  }
  if (deltaE < 6.5) {
    return { label: 'Close mix', detail: 'A painter would accept this from the palette.' }
  }
  if (deltaE < 11) {
    return { label: 'Workable mix', detail: 'Near the target — nudge hue or value by eye.' }
  }
  return {
    label: 'Best available',
    detail: 'This colour sits outside the palette. This is the closest mix.',
  }
}

export function hueHint(hex: string): string {
  const { a, b } = hexToOklab(hex)
  const hue = (Math.atan2(b, a) * 180) / Math.PI
  const wrapped = (hue + 360) % 360
  if (wrapped < 25 || wrapped >= 340) return 'red'
  if (wrapped < 55) return 'orange'
  if (wrapped < 95) return 'yellow'
  if (wrapped < 145) return 'green'
  if (wrapped < 200) return 'cyan'
  if (wrapped < 255) return 'blue'
  if (wrapped < 310) return 'purple'
  return 'magenta'
}
