import { clamp, linearToRgb, rgbToHex, rgbToLinear } from './convert.ts'
import type { Rgb } from './types.ts'

const BANDS = 10

const WHITE = [1.0, 1.0, 0.9999, 0.9993, 0.9992, 0.9998, 1.0, 1.0, 1.0, 1.0]
const CYAN = [0.971, 0.9426, 1.0007, 1.0007, 1.0007, 1.0007, 0.1564, 0.0, 0.0, 0.0]
const MAGENTA = [1.0, 1.0, 0.9685, 0.2229, 0.0, 0.0458, 0.8369, 1.0, 1.0, 0.9959]
const YELLOW = [0.0001, 0.0, 0.1088, 0.6651, 1.0, 1.0, 0.9996, 0.9586, 0.9685, 0.984]
const RED = [0.1012, 0.0515, 0.0, 0.0, 0.0, 0.0, 0.8325, 1.0149, 1.0149, 1.0149]
const GREEN = [0.0, 0.0, 0.0273, 0.7937, 1.0, 0.9418, 0.1719, 0.0, 0.0, 0.0025]
const BLUE = [1.0, 1.0, 0.8916, 0.3323, 0.0, 0.0, 0.0003, 0.0369, 0.0483, 0.0496]

const SECONDARY = [CYAN, MAGENTA, YELLOW] as const
const PRIMARY = [RED, GREEN, BLUE] as const

const CMF_X = [0.001368, 0.1091, 0.3156, 0.0205, 0.1789, 0.7435, 1.0313, 0.3705, 0.0406, 0.0029]
const CMF_Y = [0.000039, 0.00319, 0.0493, 0.2417, 0.8737, 0.9579, 0.5455, 0.1423, 0.0147, 0.001]
const CMF_Z = [0.00645, 0.5237, 1.7358, 0.3906, 0.0394, 0.0022, 0.0005, 0.0, 0.0, 0.0]
const DELTA_LAMBDA = (720 - 380) / 9

const WHITE_XYZ = integrate(WHITE)

export const PAPER_SPECTRUM = linearRgbToSpectrum([0.93, 0.9, 0.84])

function addScaled(target: number[], source: readonly number[], scale: number): void {
  for (let i = 0; i < BANDS; i += 1) {
    target[i] += source[i] * scale
  }
}

export function linearRgbToSpectrum(linear: Rgb): number[] {
  const r = clamp(linear[0], 0, 1)
  const g = clamp(linear[1], 0, 1)
  const b = clamp(linear[2], 0, 1)
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  const mid = r + g + b - min - max
  const minIndex = r <= g && r <= b ? 0 : g <= b ? 1 : 2
  const maxIndex = r >= g && r >= b ? 0 : g >= b ? 1 : 2
  const spectrum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  addScaled(spectrum, WHITE, min)
  addScaled(spectrum, SECONDARY[minIndex], mid - min)
  addScaled(spectrum, PRIMARY[maxIndex], max - mid)
  return spectrum.map((value) => clamp(value, 0, 1))
}

function integrate(spectrum: readonly number[]): [number, number, number] {
  let x = 0
  let y = 0
  let z = 0
  for (let i = 0; i < BANDS; i += 1) {
    const reflectance = spectrum[i]
    x += reflectance * CMF_X[i] * DELTA_LAMBDA
    y += reflectance * CMF_Y[i] * DELTA_LAMBDA
    z += reflectance * CMF_Z[i] * DELTA_LAMBDA
  }
  return [x, y, z]
}

function xyzToLinearSrgb(xyz: readonly [number, number, number]): Rgb {
  const [x, y, z] = xyz
  return [
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.204 * y + 1.057 * z,
  ]
}

export function spectrumToLinearRgb(spectrum: readonly number[]): Rgb {
  const xyz = integrate(spectrum)
  const rgb = xyzToLinearSrgb(xyz)
  const white = xyzToLinearSrgb(WHITE_XYZ)
  return [
    clamp(rgb[0] / white[0], 0, 1),
    clamp(rgb[1] / white[1], 0, 1),
    clamp(rgb[2] / white[2], 0, 1),
  ]
}

export function hexToSpectrum(hex: string): number[] {
  return linearRgbToSpectrum(rgbToLinear(hexToRgbSafe(hex)))
}

function hexToRgbSafe(hex: string): Rgb {
  const value = hex.startsWith('#') ? hex.slice(1) : hex
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function ksFromReflectance(reflectance: number, scattering: number): { k: number; s: number } {
  const r = clamp(reflectance, 0.0008, 0.9992)
  const s = Math.max(scattering, 0.05)
  return { k: (s * (1 - r) ** 2) / (2 * r), s }
}

function reflectanceFromKs(k: number, s: number): number {
  const ks = k / Math.max(s, 1e-8)
  return clamp(1 + ks - Math.sqrt(ks * ks + 2 * ks), 0, 1)
}

export type SpectralPigment = {
  spectrum: readonly number[]
  scattering: number
  weight: number
}

export function mixSpectra(pigments: readonly SpectralPigment[]): number[] {
  const kBands = new Array<number>(BANDS).fill(0)
  const sBands = new Array<number>(BANDS).fill(0)
  for (const pigment of pigments) {
    if (pigment.weight <= 0) continue
    for (let i = 0; i < BANDS; i += 1) {
      const { k, s } = ksFromReflectance(pigment.spectrum[i], pigment.scattering)
      kBands[i] += pigment.weight * k
      sBands[i] += pigment.weight * s
    }
  }
  return kBands.map((k, i) => reflectanceFromKs(k, sBands[i]))
}

export function mixToHex(pigments: readonly SpectralPigment[]): string {
  return rgbToHex(linearToRgb(spectrumToLinearRgb(mixSpectra(pigments))))
}
