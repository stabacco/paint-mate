import { paintsForMedium } from './palettes.ts'
import { findRecipes } from './solve.ts'
import type { MakerFilter, Medium, Paint } from './types.ts'

export function suggestPaintsForColours(
  hexes: readonly string[],
  medium: Medium,
  maker: MakerFilter,
  extraPaints: Paint[] = [],
): string[] {
  const pool = paintsForMedium(medium, extraPaints).filter(
    (paint) => maker === 'all' || paint.maker === maker,
  )
  const ids = pool.map((paint) => paint.id)
  if (ids.length === 0 || hexes.length === 0) return []

  const needed = new Set<string>()
  for (const hex of hexes) {
    const recipes = findRecipes(hex, ids, medium, 2, extraPaints)
    const best = recipes[0]
    if (!best) continue
    for (const part of best.parts) needed.add(part.paintId)
    const second = recipes[1]
    if (second && best.deltaE > 5) {
      for (const part of second.parts) needed.add(part.paintId)
    }
  }
  return [...needed]
}
