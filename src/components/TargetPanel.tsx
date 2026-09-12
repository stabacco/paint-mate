import { useId } from 'react'
import styled from 'styled-components'
import { contrastInk, isValidHex, normaliseHex } from '../color/convert.ts'
import { Button, Card, CardTitle, Eyebrow, Field, Row, TextInput } from './ui.ts'

const Well = styled.button<{ $color: string }>`
  width: 100%;
  min-height: 7.2rem;
  border: 0;
  border-radius: 18px;
  background:
    radial-gradient(circle at 22% 20%, rgba(255, 255, 255, 0.22), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(0, 0, 0, 0.18)),
    ${({ $color }) => $color};
  color: ${({ $color }) => contrastInk($color)};
  display: grid;
  align-content: end;
  justify-items: start;
  padding: 1rem;
  text-align: left;
  box-shadow: inset 0 0 0 1px rgba(28, 22, 18, 0.12);
  touch-action: manipulation;

  @media (min-width: 840px) {
    min-height: 9.5rem;
  }

  strong {
    font-family: ${({ theme }) => theme.fontDisplay};
    font-size: 1.6rem;
    font-weight: 600;
  }
`

const Native = styled.input`
  width: 3.25rem;
  height: 2.75rem;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.line};
  border-radius: 10px;
  background: transparent;
  overflow: hidden;
`

type TargetPanelProps = {
  hex: string
  hexDraft: string
  onHexDraft: (value: string) => void
  onCommitHex: (hex: string) => void
  onPickFromScreen?: () => void
  canPickFromScreen?: boolean
}

export function TargetPanel({
  hex,
  hexDraft,
  onHexDraft,
  onCommitHex,
  onPickFromScreen,
  canPickFromScreen,
}: TargetPanelProps) {
  const pickerId = useId()

  return (
    <Card>
      <Eyebrow>Target colour</Eyebrow>
      <CardTitle>What are you matching?</CardTitle>
      <Well
        type="button"
        $color={hex}
        onClick={() => document.getElementById(pickerId)?.click()}
      >
        <strong>{hex}</strong>
      </Well>
      <Row>
        <Field>
          Hex
          <TextInput
            value={hexDraft}
            spellCheck={false}
            onChange={(event) => onHexDraft(event.target.value)}
            onBlur={() => {
              if (isValidHex(hexDraft)) onCommitHex(normaliseHex(hexDraft))
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && isValidHex(hexDraft)) {
                onCommitHex(normaliseHex(hexDraft))
              }
            }}
          />
        </Field>
        <Field>
          Picker
          <Native
            id={pickerId}
            type="color"
            value={hex}
            onChange={(event) => onCommitHex(event.target.value.toUpperCase())}
            aria-label="Colour picker"
          />
        </Field>
        {canPickFromScreen ? (
          <Button type="button" $variant="ghost" onClick={onPickFromScreen}>
            Pick from screen
          </Button>
        ) : null}
      </Row>
    </Card>
  )
}
