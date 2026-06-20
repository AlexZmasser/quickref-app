# QuickRef — Door Hardware Service Desk

A standalone, deployable version of the QuickRef tool: searchable reference entries, a product catalog with linked products, and call notes, with photo support.

## What changed from the Claude.ai artifact version

The original was built using Claude.ai's `window.storage` API, which only exists inside Claude.ai. This version swaps that for a small shim (`src/main.jsx`) that uses the browser's own `localStorage` instead, so it works as a normal website. Everything else (UI, features, data shape) is unchanged.

**Storage behaviour once self-hosted:** data is saved per browser/device (not per account), and survives refreshes and reopening the site — but clearing your browser's site data, or opening it in a different browser, starts fresh. Use the in-app Export button periodically if you want a backup file.

## 1. Run it locally

```bash
npm install
npm run dev
```

This starts a local dev server (Vite will print the URL, usually `http://localhost:5173`).

## 2. Build it

```bash
npm run build
```

This produces a static `dist/` folder — the actual deployable website.

## 3. Deploy to GitHub Pages

### Option A — one command (recommended)

1. Create a new repo on GitHub (e.g. `quickref-app`) and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/quickref-app.git
   git push -u origin main
   ```
2. Install dependencies if you haven't already:
   ```bash
   npm install
   ```
3. Build and publish in one step:
   ```bash
   npm run deploy
   ```
   This builds the site and pushes the `dist/` folder to a `gh-pages` branch automatically (via the `gh-pages` package).
4. On GitHub, go to **Settings → Pages** on your repo, and under "Build and deployment", set **Source** to "Deploy from a branch" and **Branch** to `gh-pages` / `(root)`. Save.
5. Your site will be live at:
   ```
   https://YOUR-USERNAME.github.io/quickref-app/
   ```
   (First deploy can take a minute or two to go live.)

Whenever you make changes, just run `npm run deploy` again to republish.

### Option B — easier alternatives

If GitHub Pages ever feels fiddly, **Vercel** or **Netlify** are both free and arguably simpler for React apps — you connect the GitHub repo and they auto-detect Vite, build, and deploy on every push, no `gh-pages` branch needed.

## Notes

- Tailwind is loaded via CDN in `index.html` for simplicity — no build configuration needed. Fine for a personal/portfolio project.
- No data leaves your browser — there's no backend, database, or analytics.
