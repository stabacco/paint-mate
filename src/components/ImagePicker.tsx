import { useEffect, useRef, useState, type PointerEvent } from 'react'
import styled from 'styled-components'
import { rgbToHex } from '../color/convert.ts'
import {
  Button,
  Card,
  CardTitle,
  ErrorText,
  Eyebrow,
  Field,
  HiddenFile,
  Note,
  Row,
  TextInput,
} from './ui.ts'

const SAMPLES = [
  {
    name: 'Tomato',
    url: 'https://images.unsplash.com/photo-1546470427-e26264be0b0b?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Peony',
    url: 'https://images.unsplash.com/photo-1490750967861-4baa05c2469a?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Coast',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
  },
]

const Frame = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: #221c18;
  min-height: 220px;
`

const Stage = styled.canvas`
  width: 100%;
  height: min(48vw, 280px);
  display: block;
  touch-action: none;
  cursor: crosshair;

  @media (min-width: 840px) {
    height: min(52vw, 360px);
  }
`

const Empty = styled.p`
  position: absolute;
  inset: 0;
  margin: 0;
  display: grid;
  place-items: center;
  color: #e8dccb;
  text-align: center;
  padding: 1.5rem;
  pointer-events: none;
`

const Loupe = styled.aside<{ $x: number; $y: number; $color: string }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid #fff8ee;
  background: ${({ $color }) => $color};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  pointer-events: none;
  transform: translate(18px, -90px);
`

const Sample = styled.button<{ $image: string }>`
  width: 3.4rem;
  height: 2.4rem;
  border: 1px solid ${({ theme }) => theme.line};
  border-radius: 10px;
  background: center / cover no-repeat url(${({ $image }) => $image});
`

type ImagePickerProps = {
  onPick: (hex: string) => void
}

export function ImagePicker({ onPick }: ImagePickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hover, setHover] = useState<{ x: number; y: number; color: string } | null>(null)
  const [hasImage, setHasImage] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (imageRef.current) drawImage(imageRef.current)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function drawImage(image: HTMLImageElement) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#221c18'
    ctx.fillRect(0, 0, rect.width, rect.height)
    const scale = Math.min(rect.width / image.width, rect.height / image.height)
    const width = image.width * scale
    const height = image.height * scale
    const x = (rect.width - width) / 2
    const y = (rect.height - height) / 2
    ctx.drawImage(image, x, y, width, height)
  }

  function sampleAt(clientX: number, clientY: number): string | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const x = Math.round((clientX - rect.left) * dpr)
    const y = Math.round((clientY - rect.top) * dpr)
    const size = 3
    const data = ctx.getImageData(
      Math.max(0, x - 1),
      Math.max(0, y - 1),
      size,
      size,
    ).data
    let r = 0
    let g = 0
    let b = 0
    let count = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 10) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count += 1
    }
    if (!count) return null
    return rgbToHex([r / count, g / count, b / count])
  }

  async function loadUrl(raw: string, fromUser = true) {
    const trimmed = raw.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      const image = await fetchImage(trimmed)
      imageRef.current = image
      drawImage(image)
      setHasImage(true)
      if (fromUser) setUrl(trimmed)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load that image.')
    } finally {
      setBusy(false)
    }
  }

  function handlePointer(event: PointerEvent<HTMLCanvasElement>, commit: boolean) {
    const color = sampleAt(event.clientX, event.clientY)
    if (!color) return
    const rect = event.currentTarget.getBoundingClientRect()
    setHover({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      color,
    })
    if (commit) onPick(color)
  }

  return (
    <Card>
      <Eyebrow>From a photo</Eyebrow>
      <CardTitle>Load an image, then tap a colour</CardTitle>
      <Row>
        <Field>
          Image URL
          <TextInput
            value={url}
            placeholder="https://…"
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void loadUrl(url)
            }}
          />
        </Field>
        <Button type="button" onClick={() => void loadUrl(url)} disabled={busy}>
          {busy ? 'Loading…' : 'Load'}
        </Button>
        <Button type="button" $variant="ghost" onClick={() => fileRef.current?.click()}>
          Upload
        </Button>
        <HiddenFile
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            void loadUrl(URL.createObjectURL(file), false)
          }}
        />
      </Row>
      <Row>
        <Note>Or try a sample</Note>
        {SAMPLES.map((sample) => (
          <Sample
            key={sample.name}
            type="button"
            $image={sample.url}
            title={sample.name}
            aria-label={`Load ${sample.name} sample`}
            onClick={() => void loadUrl(sample.url)}
          />
        ))}
      </Row>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Frame>
        <Stage
          ref={canvasRef}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            handlePointer(event, true)
          }}
          onPointerMove={(event) => handlePointer(event, event.buttons === 1)}
          onPointerLeave={() => setHover(null)}
        />
        {hasImage ? null : <Empty>Load a photo, then tap to sample a colour.</Empty>}
        {hover ? <Loupe $x={hover.x} $y={hover.y} $color={hover.color} /> : null}
      </Frame>
    </Card>
  )
}

async function fetchImage(url: string): Promise<HTMLImageElement> {
  const candidates = isLocalUrl(url) ? [url] : [url, proxied(url)]
  let lastError: unknown
  for (const candidate of candidates) {
    try {
      return await decodeImage(candidate)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Could not load that image (CORS).')
}

function isLocalUrl(url: string): boolean {
  return url.startsWith('blob:') || url.startsWith('data:')
}

function proxied(url: string): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&n=-1`
}

function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load that image.'))
    image.src = src
  })
}
