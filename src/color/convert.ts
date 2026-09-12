import type { OkLab, Rgb } from './types.ts'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function hexToRgb(hex: string): Rgb {
  const value = normaliseHex(hex)
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ]
}

export function rgbToHex(rgb: Rgb): string {
  return `#${rgb
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase()
}

export function normaliseHex(input: string): string {
  const trimmed = input.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const [, r, g, b] = withHash
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return withHash.toUpperCase()
  }
  throw new Error(`Invalid hex colour: ${input}`)
}

export function isValidHex(input: string): boolean {
  try {
    normaliseHex(input)
    return true
  } catch {
    return false
  }
}

export function srgbChannelToLinear(channel: number): number {
  const c = clamp(channel / 255, 0, 1)
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function linearChannelToSrgb(channel: number): number {
  const c = clamp(channel, 0, 1)
  const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  return clamp(encoded * 255, 0, 255)
}

export function rgbToLinear(rgb: Rgb): Rgb {
  return [
    srgbChannelToLinear(rgb[0]),
    srgbChannelToLinear(rgb[1]),
    srgbChannelToLinear(rgb[2]),
  ]
}

export function linearToRgb(linear: Rgb): Rgb {
  return [
    linearChannelToSrgb(linear[0]),
    linearChannelToSrgb(linear[1]),
    linearChannelToSrgb(linear[2]),
  ]
}

export function linearToOklab(linear: Rgb): OkLab {
  const l = 0.4122214708 * linear[0] + 0.5363325363 * linear[1] + 0.0514459929 * linear[2]
  const m = 0.2119034982 * linear[0] + 0.6806995451 * linear[1] + 0.1073969566 * linear[2]
  const s = 0.0883024619 * linear[0] + 0.2817188376 * linear[1] + 0.6299787005 * linear[2]
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  }
}

export function rgbToOklab(rgb: Rgb): OkLab {
  return linearToOklab(rgbToLinear(rgb))
}

export function hexToOklab(hex: string): OkLab {
  return rgbToOklab(hexToRgb(hex))
}

export function deltaE(a: OkLab, b: OkLab): number {
  const dL = a.L - b.L
  const da = a.a - b.a
  const db = a.b - b.b
  return 100 * Math.sqrt(dL * dL + da * da + db * db)
}

export function hexDeltaE(a: string, b: string): number {
  return deltaE(hexToOklab(a), hexToOklab(b))
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = rgbToLinear(hexToRgb(hex))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastInk(hex: string): string {
  return relativeLuminance(hex) > 0.42 ? '#1C1612' : '#FFF8EE'
}
