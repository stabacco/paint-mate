import styled from 'styled-components'

export const Page = styled.main`
  width: min(1180px, calc(100% - 1.5rem));
  margin: 0 auto;
  padding: calc(1.25rem + env(safe-area-inset-top)) 0 calc(4rem + env(safe-area-inset-bottom));

  @media (min-width: 840px) {
    width: min(1180px, calc(100% - 3rem));
    padding-top: 2rem;
  }
`

export const TopBar = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.4rem;

  @media (min-width: 840px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`

export const Brand = styled.section`
  display: grid;
  gap: 0.35rem;
`

export const Mark = styled.span`
  display: inline-flex;
  gap: 0.28rem;
  margin-bottom: 0.15rem;
`

export const Blob = styled.i<{ $color: string }>`
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: inline-block;
  box-shadow: 0 0 0 2px ${({ theme }) => theme.paper};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fontDisplay};
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 0.95;
`

export const Tagline = styled.p`
  margin: 0;
  max-width: 36rem;
  color: ${({ theme }) => theme.inkMuted};
  font-size: 0.98rem;
`

export const Studio = styled.section`
  display: grid;
  gap: 1rem;
  grid-template-areas:
    'target'
    'recipe'
    'image'
    'palette';

  @media (min-width: 920px) {
    grid-template-columns: 1.05fr 0.95fr;
    grid-template-areas:
      'target recipe'
      'image recipe'
      'palette palette';
    align-items: start;
  }
`

export const TargetArea = styled.section`
  grid-area: target;
`

export const RecipeArea = styled.section`
  grid-area: recipe;

  @media (min-width: 920px) {
    position: sticky;
    top: 0.75rem;
  }
`

export const ImageArea = styled.section`
  grid-area: image;
`

export const PaletteArea = styled.section`
  grid-area: palette;
`

export const Card = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.line};
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 1.1rem 1.1rem 1.2rem;
`

export const CardTitle = styled.h2`
  margin: 0 0 0.85rem;
  font-family: ${({ theme }) => theme.fontDisplay};
  font-size: 1.35rem;
  font-weight: 600;
`

export const Eyebrow = styled.p`
  margin: 0 0 0.2rem;
  color: ${({ theme }) => theme.inkMuted};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`

export const Stack = styled.section`
  display: grid;
  gap: 0.85rem;
`

export const Row = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
`

export const Field = styled.label`
  display: grid;
  gap: 0.35rem;
  flex: 1 1 8rem;
  color: ${({ theme }) => theme.inkMuted};
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

export const TextInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.line};
  background: ${({ theme }) => theme.paper};
  color: ${({ theme }) => theme.ink};
  border-radius: 12px;
  padding: 0.75rem 0.8rem;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;

  &:focus {
    border-color: ${({ theme }) => theme.navy};
    box-shadow: 0 0 0 3px rgba(42, 63, 95, 0.12);
  }
`

export const Button = styled.button<{ $variant?: 'solid' | 'ghost' | 'tiny' }>`
  border: 1px solid
    ${({ theme, $variant }) => ($variant === 'ghost' || $variant === 'tiny' ? theme.line : theme.navy)};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' || $variant === 'tiny' ? theme.surface : theme.navy};
  color: ${({ theme, $variant }) =>
    $variant === 'ghost' || $variant === 'tiny' ? theme.ink : '#F7F1E8'};
  border-radius: 999px;
  min-height: ${({ $variant }) => ($variant === 'tiny' ? '2.4rem' : '2.75rem')};
  padding: ${({ $variant }) => ($variant === 'tiny' ? '0.4rem 0.8rem' : '0.62rem 0.95rem')};
  font-size: ${({ $variant }) => ($variant === 'tiny' ? '0.86rem' : '0.95rem')};
  font-weight: 600;
  touch-action: manipulation;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    transform: none;
    cursor: wait;
  }
`

export const HiddenFile = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`

export const Note = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.inkMuted};
  font-size: 0.86rem;
`

export const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.accent};
  font-size: 0.88rem;
`
