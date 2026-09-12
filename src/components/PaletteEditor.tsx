import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { isValidHex, normaliseHex } from '../color/convert.ts'
import {
  PALETTE_SETS,
  defaultEnabledIds,
  paintsForMedium,
} from '../color/palettes.ts'
import {
  MAKER_LABELS,
  MAKER_SHOPS,
  MAKERS,
  type Maker,
  type MakerFilter,
  type Medium,
  type Paint,
} from '../color/types.ts'
import { Button, Card, CardTitle, Eyebrow, Field, Note, Row, TextInput } from './ui.ts'

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
  gap: 0.35rem;
  justify-items: stretch;
  opacity: ${({ $on }) => ($on ? 1 : 0.46)};
  text-align: left;
  touch-action: manipulation;
  position: relative;
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

const Chip = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ theme, $active }) => ($active ? theme.ink : theme.line)};
  background: ${({ theme, $active }) => ($active ? theme.ink : theme.surface)};
  color: ${({ theme, $active }) => ($active ? theme.paper : theme.ink)};
  border-radius: 999px;
  min-height: 2.4rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  touch-action: manipulation;
`

const ShopLink = styled.a`
  color: ${({ theme }) => theme.navy};
  font-weight: 650;
`

const AddForm = styled.section`
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px dashed ${({ theme }) => theme.line};
  border-radius: 16px;
  background: ${({ theme }) => theme.paper};
`

const Remove = styled.button`
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 999px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.ink};
  font-size: 1rem;
  line-height: 1;
`

type PaletteEditorProps = {
  medium: Medium
  enabledIds: string[]
  customPaints: Paint[]
  targetHex: string
  maker: MakerFilter
  onMakerChange: (maker: MakerFilter) => void
  onToggle: (id: string) => void
  onEnableIds: (ids: string[], mode: 'add' | 'replace') => void
  onReset: () => void
  onAddCustom: (paint: Paint) => void
  onRemoveCustom: (id: string) => void
}

export function PaletteEditor({
  medium,
  enabledIds,
  customPaints,
  targetHex,
  maker,
  onMakerChange,
  onToggle,
  onEnableIds,
  onReset,
  onAddCustom,
  onRemoveCustom,
}: PaletteEditorProps) {
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftHex, setDraftHex] = useState(targetHex)
  const [draftPigment, setDraftPigment] = useState('')
  const enabled = new Set(enabledIds)
  const paints = paintsForMedium(medium, customPaints)
  const sets = PALETTE_SETS.filter((set) => set.medium === medium).filter(
    (set) => maker === 'all' || set.maker === maker,
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return paints.filter((paint) => {
      if (maker !== 'all' && paint.maker !== maker) return false
      if (!needle) return true
      return `${paint.name} ${paint.pigment} ${MAKER_LABELS[paint.maker]}`
        .toLowerCase()
        .includes(needle)
    })
  }, [maker, paints, query])

  const shop = maker === 'all' ? null : MAKER_SHOPS[maker]
  const defaults = defaultEnabledIds(medium)

  function submitCustom() {
    if (!draftName.trim() || !isValidHex(draftHex)) return
    onAddCustom({
      id: `custom-${Date.now().toString(36)}`,
      name: draftName.trim(),
      pigment: draftPigment.trim() || 'custom',
      hex: normaliseHex(draftHex),
      opacity: 'semi',
      scattering: 0.48,
      mediums: [medium],
      maker: 'custom',
    })
    setDraftName('')
    setDraftPigment('')
    setAdding(false)
    onMakerChange('custom')
  }

  return (
    <Card>
      <Eyebrow>Your palette</Eyebrow>
      <CardTitle>Which tubes are on the table?</CardTitle>
      <Note>
        {enabledIds.length} active of {paints.length} in the catalogue. Mixes use the{' '}
        {maker === 'all' ? 'tubes you leave on' : `${MAKER_LABELS[maker as Maker]} tubes you leave on`}
        . Daniel Smith and Winsor & Newton lists follow colours stocked at{' '}
        <ShopLink href="https://seniorart.com.au" target="_blank" rel="noreferrer">
          Senior Art Supplies
        </ShopLink>
        .
      </Note>
      <Row>
        <Chip type="button" $active={maker === 'all'} onClick={() => onMakerChange('all')}>
          All makers
        </Chip>
        {MAKERS.map((id) => (
          <Chip key={id} type="button" $active={maker === id} onClick={() => onMakerChange(id)}>
            {MAKER_LABELS[id]}
          </Chip>
        ))}
      </Row>
      {shop ? (
        <Note>
          Browse {MAKER_LABELS[maker as Maker]} at{' '}
          <ShopLink href={shop.url} target="_blank" rel="noreferrer">
            {shop.label}
          </ShopLink>
          .
        </Note>
      ) : null}
      <Field>
        Search colours
        <TextInput
          value={query}
          placeholder="Hansa, quinacridone, PB29…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </Field>
      <Row>
        <Button type="button" $variant="tiny" onClick={onReset}>
          Common defaults
        </Button>
        <Button
          type="button"
          $variant="tiny"
          onClick={() => onEnableIds(visible.map((paint) => paint.id), 'add')}
        >
          Enable visible
        </Button>
        <Button
          type="button"
          $variant="tiny"
          onClick={() =>
            onEnableIds(
              enabledIds.filter((id) => !visible.some((paint) => paint.id === id)),
              'replace',
            )
          }
        >
          Clear visible
        </Button>
        <Button type="button" $variant="tiny" onClick={() => {
          setDraftHex(targetHex)
          setAdding((value) => !value)
        }}>
          {adding ? 'Cancel' : 'Add a colour'}
        </Button>
      </Row>
      {sets.length > 0 ? (
        <Row>
          {sets.map((set) => (
            <Button
              key={set.id}
              type="button"
              $variant="tiny"
              onClick={() => onEnableIds(set.ids, 'add')}
            >
              Add {set.name}
            </Button>
          ))}
        </Row>
      ) : null}
      {adding ? (
        <AddForm>
          <Field>
            Tube name
            <TextInput
              value={draftName}
              placeholder="Daniel Smith Lunar Violet"
              onChange={(event) => setDraftName(event.target.value)}
            />
          </Field>
          <Row>
            <Field>
              Hex
              <TextInput
                value={draftHex}
                onChange={(event) => setDraftHex(event.target.value)}
              />
            </Field>
            <Field>
              Pigment
              <TextInput
                value={draftPigment}
                placeholder="PV23"
                onChange={(event) => setDraftPigment(event.target.value)}
              />
            </Field>
          </Row>
          <Button type="button" onClick={submitCustom} disabled={!draftName.trim()}>
            Save to my colours
          </Button>
          <Note>Uses the current medium ({medium}). Hex can match the target swatch above.</Note>
        </AddForm>
      ) : null}
      <Grid>
        {visible.map((paint) => (
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
            <Code>
              {MAKER_LABELS[paint.maker]} · {paint.pigment}
            </Code>
            {paint.maker === 'custom' ? (
              <Remove
                type="button"
                aria-label={`Remove ${paint.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveCustom(paint.id)
                }}
              >
                ×
              </Remove>
            ) : null}
          </Pan>
        ))}
      </Grid>
      {visible.length === 0 ? (
        <Note>
          {query.trim()
            ? 'No colours match that search.'
            : maker === 'custom'
              ? 'Add a colour to keep tubes that are not in the catalogue.'
              : maker === 'all'
                ? 'No colours match that search.'
                : `No ${MAKER_LABELS[maker]} tubes are listed for ${medium}.`}
        </Note>
      ) : null}
      <Note>
        Defaults for this medium: {defaults.length} studio staples. Your selection and custom
        colours are saved on this device.
      </Note>
    </Card>
  )
}
