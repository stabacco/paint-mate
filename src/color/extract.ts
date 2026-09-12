import { hexDeltaE, rgbToHex, rgbToOklab } from './convert.ts'
import type { OkLab } from './types.ts'

const FRAME = '#221C18'

type Sample = OkLab & { hex: string; weight: number }

export function extractImageColours(
  pixels: Uint8ClampedArray,
  options?: { count?: number; ignoreHex?: string },
): string[] {
  const wanted = options?.count ?? 10
  const ignore = (options?.ignoreHex ?? FRAME).toUpperCase()
  const bins = new Map<string, Sample>()
  const step = Math.max(4, Math.floor(pixels.length / 4 / 8000) * 4)

  for (let i = 0; i < pixels.length; i += step) {
    const alpha = pixels[i + 3]
    if (alpha < 24) continue
    const hex = rgbToHex([pixels[i], pixels[i + 1], pixels[i + 2]])
    if (hexDeltaE(hex, ignore) < 4) continue
    const lab = rgbToOklab([pixels[i], pixels[i + 1], pixels[i + 2]])
    const key = `${Math.round(lab.L * 18)}:${Math.round(lab.a * 18)}:${Math.round(lab.b * 18)}`
    const existing = bins.get(key)
    if (existing) {
      existing.weight += 1
      continue
    }
    bins.set(key, { ...lab, hex, weight: 1 })
  }

  const ranked = [...bins.values()].sort((a, b) => b.weight - a.weight)
  const chosen: Sample[] = []
  for (const sample of ranked) {
    if (chosen.some((item) => hexDeltaE(item.hex, sample.hex) < 9)) continue
    chosen.push(sample)
    if (chosen.length >= wanted) break
  }
  return chosen.map((sample) => sample.hex)
}
