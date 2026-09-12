# Paint Mate

A small studio companion for matching any colour with the paints you already own.

Give it a reddish target and it might answer: **60% burnt sienna + 40% alizarin crimson**. Switch medium (watercolour, gouache, acrylic, oil), load a photo from a URL, tap the colour, and toggle which tubes are on your palette.

## Run locally

```bash
yarn
yarn dev
```

## GitHub Pages

Live site: `https://stabacco.github.io/paint-mate/`

**One-time setup (repo owner, in the browser):**

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Save. If Pages was never turned on, this step cannot be done from the workflow.

Then either push to `main`, or run **Actions → Deploy GitHub Pages → Run workflow**.

If a deploy fails, start a **new** workflow run. Do not re-run only the failed job — that uploads a second `github-pages` artifact and breaks deploy.

## What it does

- **Target a colour** with hex, a colour picker, the optional screen eyedropper, or a photo
- **Load images** from a URL (with a CORS proxy fallback) or from a file
- **Decompose** the target into 1–3 painterly pigments using subtractive Kubelka–Munk mixing
Catalogue colours follow Daniel Smith Extra Fine and Winsor & Newton Professional ranges stocked at [Senior Art Supplies](https://seniorart.com.au). Filter the palette by maker, load a mixing set, or add a tube that is not listed yet.

Mixes are estimates. Real tubes, paper and binders vary — use the recipe as a starting point and adjust by eye.
