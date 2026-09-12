import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ImagePicker } from './components/ImagePicker.tsx'
import { MediumTabs } from './components/MediumTabs.tsx'
import { MixRecipe } from './components/MixRecipe.tsx'
import { PaletteEditor } from './components/PaletteEditor.tsx'
import { TargetPanel } from './components/TargetPanel.tsx'
import { Brand, Blob, ImageArea, Mark, Page, PaletteArea, RecipeArea, Studio, Tagline, Title, TopBar, TargetArea } from './components/ui.ts'
import { layersForRecipe, type ColourPlan } from './color/layers.ts'
import { defaultEnabledIds, paintLookup } from './color/palettes.ts'
import { findRecipes } from './color/solve.ts'
import { suggestPaintsForColours } from './color/suggest.ts'
import type { MakerFilter, Medium, Paint } from './color/types.ts'
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
  const [customPaints, setCustomPaints] = useState<Paint[]>(INITIAL?.customPaints ?? [])
  const [maker, setMaker] = useState<MakerFilter>(INITIAL?.maker ?? 'all')
  const [matchingPalette, setMatchingPalette] = useState(false)
  const [colourPlans, setColourPlans] = useState<ColourPlan[]>([])
  const enabledIds = enabled[medium]
  const mixIdentity = `${targetHex}|${medium}|${enabledIds.join(',')}`
  const [recipeSelection, setRecipeSelection] = useState({ key: mixIdentity, index: 0 })
  if (recipeSelection.key !== mixIdentity) {
    setRecipeSelection({ key: mixIdentity, index: 0 })
  }
  const selectedRecipe = recipeSelection.index
  const canPickFromScreen = typeof window !== 'undefined' && 'EyeDropper' in window
  const paintsById = useMemo(() => paintLookup(customPaints), [customPaints])

  const recipes = useMemo(
    () => findRecipes(targetHex, enabledIds, medium, 3, customPaints),
    [targetHex, enabledIds, medium, customPaints],
  )

  const colourLayers = useMemo(
    () =>
      colourPlans.map((plan) => ({
        hex: plan.hex,
        layers: plan.recipe ? layersForRecipe(plan.recipe, paintsById, medium) : [],
      })),
    [colourPlans, medium, paintsById],
  )

  useEffect(() => {
    saveState({ medium, targetHex, enabled, customPaints, maker })
  }, [medium, targetHex, enabled, customPaints, maker])

  function setTarget(hex: string) {
    setTargetHex(hex)
    setHexDraft(hex)
  }

  function changeMedium(next: Medium) {
    setMedium(next)
    setColourPlans([])
  }

  function togglePaint(id: string) {
    setEnabled((current) => {
      const list = current[medium]
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
      return { ...current, [medium]: next }
    })
  }

  function enableIds(ids: string[], mode: 'add' | 'replace') {
    setEnabled((current) => {
      if (mode === 'replace') return { ...current, [medium]: ids }
      const merged = [...current[medium]]
      for (const id of ids) {
        if (!merged.includes(id)) merged.push(id)
      }
      return { ...current, [medium]: merged }
    })
  }

  function addCustom(paint: Paint) {
    setCustomPaints((current) => [...current, paint])
    enableIds([paint.id], 'add')
  }

  function removeCustom(id: string) {
    setCustomPaints((current) => current.filter((paint) => paint.id !== id))
    setEnabled((current) => ({
      ...current,
      [medium]: current[medium].filter((item) => item !== id),
    }))
  }

  async function selectPaletteFromPhoto(hexes: string[]) {
    setMatchingPalette(true)
    await new Promise((resolve) => window.setTimeout(resolve, 24))
    try {
      const ids = suggestPaintsForColours(hexes, medium, maker, customPaints)
      if (ids.length > 0) enableIds(ids, 'replace')
      const paletteIds = ids.length > 0 ? ids : enabledIds
      setColourPlans(
        hexes.map((hex) => ({
          hex,
          recipe: findRecipes(hex, paletteIds, medium, 1, customPaints)[0] ?? null,
        })),
      )
      return ids
    } finally {
      setMatchingPalette(false)
    }
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
        <MediumTabs value={medium} onChange={changeMedium} />
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
            extraPaints={customPaints}
            onSelect={(index) => setRecipeSelection({ key: mixIdentity, index })}
          />
        </RecipeArea>
        <ImageArea>
          <ImagePicker
            onPick={setTarget}
            maker={maker}
            matching={matchingPalette}
            colourLayers={colourLayers}
            onResetPhoto={() => setColourPlans([])}
            onSelectPalette={selectPaletteFromPhoto}
          />
        </ImageArea>
        <PaletteArea>
          <PaletteEditor
            medium={medium}
            enabledIds={enabledIds}
            customPaints={customPaints}
            targetHex={targetHex}
            maker={maker}
            onMakerChange={setMaker}
            onToggle={togglePaint}
            onEnableIds={enableIds}
            onReset={() =>
              setEnabled((current) => ({ ...current, [medium]: defaultEnabledIds(medium) }))
            }
            onAddCustom={addCustom}
            onRemoveCustom={removeCustom}
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
