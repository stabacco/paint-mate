import styled from 'styled-components'
import { defaultEnabledIds, paintsForMedium } from '../color/palettes.ts'
import type { Medium } from '../color/types.ts'
import { Button, Card, CardTitle, Eyebrow, Note, Row } from './ui.ts'

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.6rem, 1fr));
  gap: 0.55rem;
`

const Pan = styled.button<{ $color: string; $on: boolean }>`
  appearance: none;
  border: 1px solid ${({ theme, $on }) => ($on ? theme.ink : theme.line)};
  border-radius: 16px;
  min-height: 6.4rem;
  padding: 0.55rem;
  background: ${({ theme }) => theme.paper};
  display: grid;
  gap: 0.4rem;
  justify-items: stretch;
  opacity: ${({ $on }) => ($on ? 1 : 0.46)};
  text-align: left;
  touch-action: manipulation;
`

const Well = styled.i<{ $color: string }>`
  display: block;
  height: 3.1rem;
  border-radius: 999px 999px 18px 18px;
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.28), transparent 36%),
    ${({ $color }) => $color};
  box-shadow: inset 0 -10px 16px rgba(0, 0, 0, 0.18);
`

const Name = styled.strong`
  font-size: 0.82rem;
  line-height: 1.2;
`

const Code = styled.small`
  color: ${({ theme }) => theme.inkMuted};
  font-size: 0.7rem;
`

type PaletteEditorProps = {
  medium: Medium
  enabledIds: string[]
  onToggle: (id: string) => void
  onReset: () => void
  onAll: () => void
}

export function PaletteEditor({
  medium,
  enabledIds,
  onToggle,
  onReset,
  onAll,
}: PaletteEditorProps) {
  const enabled = new Set(enabledIds)
  const paints = paintsForMedium(medium)
  const defaults = defaultEnabledIds(medium)

  return (
    <Card>
      <Eyebrow>Your palette</Eyebrow>
      <CardTitle>Which tubes are on the table?</CardTitle>
      <Note>
        {enabledIds.length} of {paints.length} paints active. Mixes only use the ones you leave on.
      </Note>
      <Row>
        <Button type="button" $variant="tiny" onClick={onReset}>
          Common defaults
        </Button>
        <Button type="button" $variant="tiny" onClick={onAll}>
          Use all
        </Button>
      </Row>
      <Grid>
        {paints.map((paint) => (
          <Pan
            key={paint.id}
            type="button"
            $color={paint.hex}
            $on={enabled.has(paint.id)}
            aria-pressed={enabled.has(paint.id)}
            onClick={() => onToggle(paint.id)}
          >
            <Well $color={paint.hex} />
            <Name>{paint.name}</Name>
            <Code>{paint.pigment}</Code>
          </Pan>
        ))}
      </Grid>
      <Note>
        Defaults for this medium: {defaults.length} common studio colours. Your selection is saved
        on this device.
      </Note>
    </Card>
  )
}
