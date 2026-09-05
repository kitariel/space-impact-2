# space-impact-2

IMPACT_01 is a premium retro-futurist landing page with a playable monochrome space shooter.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to enter the system. Select PLAY NOW or launch the live hero terminal preview.

Controls: WASD / arrow keys to move, Space to fire, X or Shift for EMP, Escape to pause. Touch controls are available on phones and tablets in either orientation.

On touch devices, the flight terminal recommends landscape and also offers portrait play. Rotating during a mission pauses the same run and releases held controls; press Resume when ready. The landing-page preview opens the dedicated flight terminal on touch devices.

Mobile browser checks (Chromium and WebKit): run `npx playwright install chromium webkit`, `npm run build`, then `npm run test:mobile`. To test an existing local server instead, set `IMPACT_TEST_URL=http://localhost:3001`.

The game is an original Canvas simulation with programmatic sprites, local high score/settings, optional generated audio, three display modes, enemy waves, and a multi-core boss.

## GitHub Pages deployment

The repository includes `.github/workflows/deploy-pages.yml`. It builds Next.js as a static export and publishes it with GitHub Pages. In GitHub, open **Settings → Pages**, choose **GitHub Actions** as the source, then push to `main` or run **Deploy IMPACT_01 to GitHub Pages** from the Actions tab. The project site will be `https://kitariel.github.io/space-impact-2/` after the first successful run. GitHub Pages supports static files and custom Actions workflows; this app does not require a server. ([GitHub Pages docs](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Next.js static export docs](https://nextjs.org/docs/app/guides/static-exports))

## Protecting `main`

The current remote is a public repository and is **not a fork**. GitHub does not provide a supported way to convert an existing repository into a fork after creation; a fork must be created from another repository. If “fork only” means that nobody should edit the deployed branch directly, configure that with a branch rule:

1. Open **Settings → Rules → Rulesets → New branch ruleset**.
2. Name it `protect-main`, set enforcement to **Active**, and target the `main` branch.
3. Enable **Require a pull request before merging** and require at least one approval. Enable **Require status checks** and select `Deploy IMPACT_01 to GitHub Pages / build` after its first pull-request run.
4. Enable **Block force pushes** and **Restrict deletions**. Leave bypass actors empty unless you want a specific maintainer to merge.

For a simpler repository rule, use **Settings → Branches → Add classic branch protection rule**, enter `main`, and enable pull requests, approvals, status checks, force-push blocking, and deletion blocking. Only repository administrators can change these settings. Branch rulesets are the current GitHub approach. ([Rulesets API/docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets))

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
