import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ImagePicker } from './components/ImagePicker.tsx'
import { MediumTabs } from './components/MediumTabs.tsx'
import { MixRecipe } from './components/MixRecipe.tsx'
import { PaletteEditor } from './components/PaletteEditor.tsx'
import { TargetPanel } from './components/TargetPanel.tsx'
import { Brand, Blob, ImageArea, Mark, Page, PaletteArea, RecipeArea, Studio, Tagline, Title, TopBar, TargetArea } from './components/ui.ts'
import { defaultEnabledIds, paintsForMedium } from './color/palettes.ts'
import { findRecipes } from './color/solve.ts'
import type { Medium } from './color/types.ts'
import { loadState, saveState } from './storage.ts'

const Foot = styled.footer`
  margin-top: 1.4rem;
  color: ${({ theme }) => theme.inkMuted};
  font-size: 0.84rem;
`

const INITIAL = loadState()

export default function App() {
  const [medium, setMedium] = useState<Medium>(INITIAL?.medium ?? 'watercolour')
  const [targetHex, setTargetHex] = useState(INITIAL?.targetHex ?? '#A24A3A')
  const [hexDraft, setHexDraft] = useState(INITIAL?.targetHex ?? '#A24A3A')
  const [enabled, setEnabled] = useState<Record<Medium, string[]>>(() => ({
    watercolour: INITIAL?.enabled?.watercolour ?? defaultEnabledIds('watercolour'),
    gouache: INITIAL?.enabled?.gouache ?? defaultEnabledIds('gouache'),
    acrylic: INITIAL?.enabled?.acrylic ?? defaultEnabledIds('acrylic'),
    oil: INITIAL?.enabled?.oil ?? defaultEnabledIds('oil'),
  }))
  const enabledIds = enabled[medium]
  const mixIdentity = `${targetHex}|${medium}|${enabledIds.join(',')}`
  const [recipeSelection, setRecipeSelection] = useState({ key: mixIdentity, index: 0 })
  if (recipeSelection.key !== mixIdentity) {
    setRecipeSelection({ key: mixIdentity, index: 0 })
  }
  const selectedRecipe = recipeSelection.index
  const canPickFromScreen = typeof window !== 'undefined' && 'EyeDropper' in window

  const recipes = useMemo(
    () => findRecipes(targetHex, enabledIds, medium, 3),
    [targetHex, enabledIds, medium],
  )

  useEffect(() => {
    saveState({ medium, targetHex, enabled })
  }, [medium, targetHex, enabled])

  function setTarget(hex: string) {
    setTargetHex(hex)
    setHexDraft(hex)
  }

  function togglePaint(id: string) {
    setEnabled((current) => {
      const list = current[medium]
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
      return { ...current, [medium]: next }
    })
  }

  async function pickFromScreen() {
    const Dropper = (
      window as Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }
    ).EyeDropper
    if (!Dropper) return
    const result = await new Dropper().open()
    setTarget(result.sRGBHex.toUpperCase())
  }

  return (
    <Page>
      <TopBar>
        <Brand>
          <Mark aria-hidden="true">
            <Blob $color="#9C3B28" />
            <Blob $color="#2A3F5F" />
            <Blob $color="#C9A227" />
          </Mark>
          <Title>Paint Mate</Title>
          <Tagline>
            Given any colour, decompose it into a mix from the painterly pigments you actually own.
          </Tagline>
        </Brand>
        <MediumTabs value={medium} onChange={setMedium} />
      </TopBar>

      <Studio>
        <TargetArea>
          <TargetPanel
            hex={targetHex}
            hexDraft={hexDraft}
            onHexDraft={setHexDraft}
            onCommitHex={setTarget}
            canPickFromScreen={canPickFromScreen}
            onPickFromScreen={() => void pickFromScreen()}
          />
        </TargetArea>
        <RecipeArea>
          <MixRecipe
            targetHex={targetHex}
            medium={medium}
            recipes={recipes}
            selected={selectedRecipe}
            onSelect={(index) => setRecipeSelection({ key: mixIdentity, index })}
          />
        </RecipeArea>
        <ImageArea>
          <ImagePicker onPick={setTarget} />
        </ImageArea>
        <PaletteArea>
          <PaletteEditor
            medium={medium}
            enabledIds={enabledIds}
            onToggle={togglePaint}
            onReset={() =>
              setEnabled((current) => ({ ...current, [medium]: defaultEnabledIds(medium) }))
            }
            onAll={() =>
              setEnabled((current) => ({
                ...current,
                [medium]: paintsForMedium(medium).map((paint) => paint.id),
              }))
            }
          />
        </PaletteArea>
      </Studio>

      <Foot>
        Mixes are subtractive estimates (Kubelka–Munk on reconstructed reflectance). Tube brands,
        binders and paper all shift the result — treat this as a starting recipe, then adjust by
        eye.
      </Foot>
    </Page>
  )
}
