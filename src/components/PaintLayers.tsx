import styled from 'styled-components'
import { contrastInk } from '../color/convert.ts'
import type { PaintLayer } from '../color/layers.ts'
import { Note } from './ui.ts'

const Wrap = styled.section<{ $compact: boolean }>`
  display: grid;
  grid-template-columns: ${({ $compact }) => ($compact ? '3.4rem 1fr' : '4.6rem 1fr')};
  gap: ${({ $compact }) => ($compact ? '0.55rem' : '0.85rem')};
  align-items: stretch;
`

const Stack = styled.section`
  display: flex;
  flex-direction: column-reverse;
  min-height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(28, 22, 18, 0.12);
`

const Film = styled.i<{ $color: string; $kind: PaintLayer['kind']; $percent: number; $compact: boolean }>`
  display: block;
  background: ${({ $color }) => $color};
  min-height: ${({ $kind, $compact }) =>
    $kind === 'ground' ? ($compact ? '0.32rem' : '0.55rem') : $compact ? '0.55rem' : '1.05rem'};
  height: ${({ $kind, $percent, $compact }) =>
    $kind === 'ground'
      ? $compact
        ? '0.32rem'
        : '0.55rem'
      : `max(${$compact ? '0.55rem' : '1.05rem'}, ${($percent / 100) * ($compact ? 2.1 : 3.6)}rem)`};
`

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
  align-content: center;
`

const Step = styled.li`
  display: grid;
  grid-template-columns: 1.35rem 1fr;
  gap: 0.4rem;
  align-items: start;
`

const Index = styled.strong<{ $color: string }>`
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: ${({ $color }) => contrastInk($color)};
  display: grid;
  place-items: center;
  font-size: 0.72rem;
`

const Copy = styled.section`
  display: grid;
  gap: 0.12rem;

  strong {
    font-size: 0.88rem;
    line-height: 1.2;
  }
`

const Names = styled.section`
  display: grid;
  gap: 0.15rem;
  align-content: center;

  small {
    color: ${({ theme }) => theme.inkMuted};
    font-size: 0.72rem;
    line-height: 1.25;
  }
`

type PaintLayersProps = {
  layers: PaintLayer[]
  compact?: boolean
}

export function PaintLayers({ layers, compact = false }: PaintLayersProps) {
  const paintLayers = layers.filter((layer) => layer.kind !== 'ground')
  return (
    <Wrap $compact={compact}>
      <Stack aria-hidden="true">
        {layers.map((layer) => (
          <Film
            key={layer.id}
            $color={layer.hex}
            $kind={layer.kind}
            $percent={layer.percent}
            $compact={compact}
            title={layer.name}
          />
        ))}
      </Stack>
      {compact ? (
        <Names>
          {paintLayers.map((layer, index) => (
            <small key={layer.id}>
              {index + 1}. {layer.name}
              {layer.percent ? ` · ${layer.percent}%` : ''}
            </small>
          ))}
        </Names>
      ) : (
        <Steps>
          {layers.map((layer, index) => (
            <Step key={layer.id}>
              <Index $color={layer.hex}>{index === 0 ? '·' : index}</Index>
              <Copy>
                <strong>{layer.name}</strong>
                <Note as="span">{layer.instruction}</Note>
              </Copy>
            </Step>
          ))}
        </Steps>
      )}
    </Wrap>
  )
}
