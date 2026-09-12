import { describe, expect, it } from 'vitest'
import { layersForRecipe } from './layers.ts'
import { PAINTS_BY_ID } from './palettes.ts'
import type { Recipe } from './types.ts'

function recipe(parts: Recipe['parts'], water = 0): Recipe {
  return {
    parts,
    water,
    mixedHex: '#808080',
    deltaE: 1,
  }
}

describe('layersForRecipe', () => {
  it('puts paper under watercolour, then the lighter tube first', () => {
    const layers = layersForRecipe(
      recipe(
        [
          { paintId: 'burnt-sienna', weight: 0.4 },
          { paintId: 'hansa-yellow', weight: 0.6 },
        ],
        0.38,
      ),
      PAINTS_BY_ID,
      'watercolour',
    )
    expect(layers.map((layer) => layer.paintId)).toEqual([null, 'hansa-yellow', 'burnt-sienna'])
    expect(layers[0]?.kind).toBe('ground')
    expect(layers[1]?.kind).toBe('body')
    expect(layers[2]?.kind).toBe('glaze')
    expect(layers[1]?.instruction).toMatch(/medium wash/i)
    expect(layers[2]?.instruction).toMatch(/glaze/i)
  })

  it('lays opaque body colour before a transparent glaze in acrylic', () => {
    const layers = layersForRecipe(
      recipe([
        { paintId: 'alizarin-crimson', weight: 0.65 },
        { paintId: 'titanium-white', weight: 0.35 },
      ]),
      PAINTS_BY_ID,
      'acrylic',
    )
    expect(layers.map((layer) => layer.paintId)).toEqual([
      null,
      'titanium-white',
      'alizarin-crimson',
    ])
    expect(layers[1]?.kind).toBe('body')
    expect(layers[2]?.kind).toBe('glaze')
  })

  it('uses a single paint layer when the mix is one tube', () => {
    const layers = layersForRecipe(
      recipe([{ paintId: 'burnt-sienna', weight: 1 }]),
      PAINTS_BY_ID,
      'oil',
    )
    expect(layers).toHaveLength(2)
    expect(layers[1]?.paintId).toBe('burnt-sienna')
    expect(layers[1]?.instruction).toMatch(/single layer/)
  })
})
