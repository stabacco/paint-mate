# Paint Mate

A small studio companion for matching any colour with the paints you already own.

Give it a reddish target and it might answer: **60% burnt sienna + 40% alizarin crimson**. Switch medium (watercolour, gouache, acrylic, oil), load a photo from a URL, tap the colour, and toggle which tubes are on your palette.

## Run locally

```bash
yarn
yarn dev
```

To try it on a phone, the repo can publish to GitHub Pages from `main` (Settings → Pages → GitHub Actions). While developing, the Vite server accepts tunneled hosts so you can open a public HTTPS URL on the device.

## What it does

- **Target a colour** with hex, a colour picker, the optional screen eyedropper, or a photo
- **Load images** from a URL (with a CORS proxy fallback) or from a file
- **Decompose** the target into 1–3 painterly pigments using subtractive Kubelka–Munk mixing
Catalogue colours follow Daniel Smith Extra Fine and Winsor & Newton Professional ranges stocked at [Senior Art Supplies](https://seniorart.com.au). Filter the palette by maker, load a mixing set, or add a tube that is not listed yet.

Mixes are estimates. Real tubes, paper and binders vary — use the recipe as a starting point and adjust by eye.
