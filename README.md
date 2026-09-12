# Paint Mate

A small studio companion for matching any colour with the paints you already own.

Give it a reddish target and it might answer: **60% burnt sienna + 40% alizarin crimson**. Switch medium (watercolour, gouache, acrylic, oil), load a photo from a URL, tap the colour, and toggle which tubes are on your palette.

## Run locally

```bash
yarn
yarn dev
```

## GitHub Pages

Live site: [https://stabacco.github.io/paint-mate/](https://stabacco.github.io/paint-mate/)

Pushes to `main` rebuild the production files at the branch root (what GitHub Pages serves). `index.html` on `main` is the Vite production bundle. Local `yarn dev` copies `.github/vite-index.html` over it temporarily.

**One-time setup (repo owner):**

1. Open [Settings → Pages](https://github.com/stabacco/paint-mate/settings/pages).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**.
4. Click **Save**.

Later pushes to `main` update the site automatically.

## What it does

- **Target a colour** with hex, a colour picker, the optional screen eyedropper, or a photo
- **Load images** from a URL (with a CORS proxy fallback) or from a file
- **Decompose** the target into 1–3 painterly pigments using subtractive Kubelka–Munk mixing
Catalogue colours follow Daniel Smith Extra Fine and Winsor & Newton Professional ranges stocked at [Senior Art Supplies](https://seniorart.com.au). Filter the palette by maker, load a mixing set, or add a tube that is not listed yet.

Mixes are estimates. Real tubes, paper and binders vary — use the recipe as a starting point and adjust by eye.
