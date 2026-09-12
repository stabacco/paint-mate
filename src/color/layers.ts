import { hexToOklab } from './convert.ts'
import { describeWash, toPercents } from './mix.ts'
import type { Medium, Paint, Recipe } from './types.ts'

export type LayerKind = 'ground' | 'body' | 'glaze'

export type PaintLayer = {
  id: string
  kind: LayerKind
  paintId: string | null
  name: string
  hex: string
  percent: number
  instruction: string
}

export type ColourPlan = {
  hex: string
  recipe: Recipe | null
}

const OPACITY_RANK: Record<Paint['opacity'], number> = {
  opaque: 0,
  semi: 1,
  transparent: 2,
}

const GROUND: Record<Medium, { name: string; hex: string; instruction: string }> = {
  watercolour: {
    name: 'Paper',
    hex: '#F3EEE4',
    instruction: 'Start on paper. Wet it first if you want a softer edge.',
  },
  gouache: {
    name: 'Paper',
    hex: '#F3EEE4',
    instruction: 'Start on paper. Let each layer dry if you want a crisp edge.',
  },
  acrylic: {
    name: 'Ground',
    hex: '#E8DCC8',
    instruction: 'Start on a primed ground. Block in the body colour first.',
  },
  oil: {
    name: 'Ground',
    hex: '#E8DCC8',
    instruction: 'Start on a primed ground. Keep early layers leaner than the ones on top.',
  },
}

export function layersForRecipe(
  recipe: Recipe,
  paintsById: ReadonlyMap<string, Paint>,
  medium: Medium,
): PaintLayer[] {
  const ground = GROUND[medium]
  const layers: PaintLayer[] = [
    {
      id: 'ground',
      kind: 'ground',
      paintId: null,
      name: ground.name,
      hex: ground.hex,
      percent: 0,
      instruction: ground.instruction,
    },
  ]

  const percents = toPercents(recipe.parts.map((part) => part.weight))
  const ordered = recipe.parts
    .map((part, index) => ({
      percent: percents[index],
      paint: paintsById.get(part.paintId),
    }))
    .filter((item): item is { percent: number; paint: Paint } => Boolean(item.paint))
    .sort((a, b) => comparePaintOrder(a.paint, b.paint, a.percent, b.percent, medium))

  const wash = medium === 'watercolour' ? describeWash(recipe.water) : null
  const several = ordered.length > 1

  for (const [index, item] of ordered.entries()) {
    const kind: LayerKind = index === 0 ? 'body' : 'glaze'
    layers.push({
      id: item.paint.id,
      kind,
      paintId: item.paint.id,
      name: item.paint.name,
      hex: item.paint.hex,
      percent: item.percent,
      instruction: instructionFor(item.paint.name, item.percent, kind, medium, wash, several),
    })
  }

  return layers
}

function comparePaintOrder(
  a: Paint,
  b: Paint,
  aPercent: number,
  bPercent: number,
  medium: Medium,
): number {
  if (medium === 'watercolour') {
    const light = hexToOklab(b.hex).L - hexToOklab(a.hex).L
    if (Math.abs(light) > 0.02) return light
    return bPercent - aPercent
  }
  const opacity = OPACITY_RANK[a.opacity] - OPACITY_RANK[b.opacity]
  if (opacity !== 0) return opacity
  return bPercent - aPercent
}

function instructionFor(
  name: string,
  percent: number,
  kind: LayerKind,
  medium: Medium,
  wash: string | null,
  several: boolean,
): string {
  if (kind === 'body') {
    if (medium === 'watercolour') {
      if (wash) return `Lay ${name} first as ${wash} (${percent}% of the mix).`
      if (!several) return `Lay ${name} in a single layer.`
      return `Lay ${name} first as the body colour (${percent}% of the mix).`
    }
    if (!several) return `Block in ${name} as a single layer.`
    return `Block in ${name} first (${percent}% of the mix).`
  }
  if (medium === 'watercolour') {
    return `When that layer is dry, glaze ${name} over it (${percent}%).`
  }
  return `Then glaze ${name} over the top (${percent}%).`
}
