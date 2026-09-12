import styled from 'styled-components'
import { MEDIUMS, type Medium } from '../color/types.ts'

const labels: Record<Medium, string> = {
  watercolour: 'Watercolour',
  gouache: 'Gouache',
  acrylic: 'Acrylic',
  oil: 'Oil',
}

const Tabs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`

const Tab = styled.button<{ $active: boolean }>`
  border: 0;
  background: ${({ theme, $active }) => ($active ? theme.ink : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.paper : theme.inkMuted)};
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font-weight: 600;
  box-shadow: ${({ $active }) => ($active ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none')};
`

type MediumTabsProps = {
  value: Medium
  onChange: (medium: Medium) => void
}

export function MediumTabs({ value, onChange }: MediumTabsProps) {
  return (
    <Tabs aria-label="Painting medium">
      {MEDIUMS.map((medium) => (
        <Tab
          key={medium}
          type="button"
          $active={value === medium}
          aria-pressed={value === medium}
          onClick={() => onChange(medium)}
        >
          {labels[medium]}
        </Tab>
      ))}
    </Tabs>
  )
}
