import styled from 'styled-components'
import { contrastInk } from '../color/convert.ts'
import { layersForRecipe } from '../color/layers.ts'
import { describeWash, toPartsRatio, toPercents } from '../color/mix.ts'
import { paintLookup } from '../color/palettes.ts'
import { hueHint, matchQuality } from '../color/solve.ts'
import { MAKER_LABELS, type Medium, type Paint, type Recipe } from '../color/types.ts'
import { PaintLayers } from './PaintLayers.tsx'
import { Button, Card, CardTitle, Eyebrow, Note, Row } from './ui.ts'

const Compare = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1rem;
`

const Swatch = styled.section<{ $color: string }>`
  min-height: 6.2rem;
  border-radius: 16px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18), transparent 40%),
    ${({ $color }) => $color};
  color: ${({ $color }) => contrastInk($color)};
  display: grid;
  align-content: end;
  padding: 0.8rem;
  box-shadow: inset 0 0 0 1px rgba(28, 22, 18, 0.1);

  small {
    opacity: 0.8;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  strong {
    font-family: ${({ theme }) => theme.fontDisplay};
    font-size: 1.15rem;
  }
`

const Quality = styled.p`
  margin: 0 0 0.9rem;
  font-weight: 650;
`

const MixList = styled.ol`
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: grid;
  gap: 0.55rem;
`

const MixItem = styled.li`
  display: grid;
  grid-template-columns: 2.6rem 1fr auto;
  gap: 0.7rem;
  align-items: center;
`

const Dot = styled.i<{ $color: string }>`
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(28, 22, 18, 0.15);
  display: block;
`

const PaintMeta = styled.section`
  display: grid;

  strong {
    font-size: 0.98rem;
  }

  small {
    color: ${({ theme }) => theme.inkMuted};
  }
`

const Amount = styled.strong`
  font-family: ${({ theme }) => theme.fontDisplay};
  font-size: 1.35rem;
`

const LayerBlock = styled.section`
  display: grid;
  gap: 0.55rem;
  margin: 0 0 1rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.line};
  border-radius: 16px;
  background: ${({ theme }) => theme.paper};
`

const LayerTitle = styled.strong`
  font-size: 0.92rem;
`

const Alt = styled.button<{ $active: boolean }>`
  display: flex;
  gap: 0.2rem;
  padding: 0.28rem;
  border-radius: 999px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.ink : theme.line)};
  background: ${({ theme }) => theme.paper};
`

const Chip = styled.i<{ $color: string }>`
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: block;
`

const mediumLabel: Record<Medium, string> = {
  watercolour: 'watercolour',
  gouache: 'gouache',
  acrylic: 'acrylic',
  oil: 'oil',
}

type MixRecipeProps = {
  targetHex: string
  medium: Medium
  recipes: Recipe[]
  selected: number
  extraPaints?: Paint[]
  onSelect: (index: number) => void
}

export function MixRecipe({
  targetHex,
  medium,
  recipes,
  selected,
  extraPaints = [],
  onSelect,
}: MixRecipeProps) {
  const lookup = paintLookup(extraPaints)
  const recipe = recipes[selected]
  if (!recipe) {
    return (
      <Card>
        <Eyebrow>Mix</Eyebrow>
        <CardTitle>Turn on some paints first</CardTitle>
        <Note>Select at least one colour from your palette to get a mix recipe.</Note>
      </Card>
    )
  }

  const percents = toPercents(recipe.parts.map((part) => part.weight))
  const ratio = toPartsRatio(percents)
  const quality = matchQuality(recipe.deltaE)
  const wash = medium === 'watercolour' ? describeWash(recipe.water) : null
  const layers = layersForRecipe(recipe, lookup, medium)
  const copy = [
    recipe.parts
      .map((part, index) => `${percents[index]}% ${lookup.get(part.paintId)?.name ?? part.paintId}`)
      .join(', '),
    layers
      .filter((layer) => layer.kind !== 'ground')
      .map((layer, index) => `${index + 1}. ${layer.instruction}`)
      .join(' '),
  ]
    .filter(Boolean)
    .join(' — ')

  return (
    <Card>
      <Eyebrow>{mediumLabel[medium]} mix</Eyebrow>
      <CardTitle>Recipe for a {hueHint(targetHex)} colour</CardTitle>
      <Compare>
        <Swatch $color={targetHex}>
          <small>Target</small>
          <strong>{targetHex}</strong>
        </Swatch>
        <Swatch $color={recipe.mixedHex}>
          <small>Your mix</small>
          <strong>{recipe.mixedHex}</strong>
        </Swatch>
      </Compare>
      <Quality>
        {quality.label}
        <Note as="span"> — {quality.detail}</Note>
      </Quality>
      <MixList>
        {recipe.parts.map((part, index) => {
          const paint = lookup.get(part.paintId)
          if (!paint) return null
          return (
            <MixItem key={paint.id}>
              <Dot $color={paint.hex} />
              <PaintMeta>
                <strong>{paint.name}</strong>
                <small>
                  {MAKER_LABELS[paint.maker]} · {paint.pigment}
                  {ratio[index] ? ` · ${ratio[index]} part${ratio[index] === 1 ? '' : 's'}` : ''}
                </small>
              </PaintMeta>
              <Amount>{percents[index]}%</Amount>
            </MixItem>
          )
        })}
      </MixList>
      <LayerBlock>
        <LayerTitle>Layers to lay down</LayerTitle>
        <Note>
          Mix on the palette, or paint these as successive layers — first layer at the bottom of
          the stack.
        </Note>
        <PaintLayers layers={layers} />
      </LayerBlock>
      {wash ? <Note>The whole mix can also be thinned to {wash}.</Note> : null}
      <Row>
        <Button
          type="button"
          $variant="ghost"
          onClick={() => void navigator.clipboard.writeText(copy)}
        >
          Copy recipe
        </Button>
        {recipes.length > 1 ? (
          <Row as="span">
            {recipes.map((item, index) => (
              <Alt
                key={`${item.mixedHex}-${index}`}
                type="button"
                $active={index === selected}
                onClick={() => onSelect(index)}
                aria-label={`Alternative mix ${index + 1}`}
              >
                {item.parts.map((part) => (
                  <Chip
                    key={part.paintId}
                    $color={lookup.get(part.paintId)?.hex ?? '#ccc'}
                  />
                ))}
              </Alt>
            ))}
          </Row>
        ) : null}
      </Row>
    </Card>
  )
}
