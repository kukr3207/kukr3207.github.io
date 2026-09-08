# Uday — AI Fieldnotes

An interactive, static portfolio for Uday Kondreddy. Built with React, TypeScript, vinext, and the Sites shadcn component library.

## Develop and check

Use Node.js 24 and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm run typecheck
pnpm run build
```

The static output is `dist/client`. No API keys, database or server are required. The three demos use original fictional records and synthetic data. Google Fonts is the only external resource fetched by the page; local font fallbacks are provided.

## Edit content

- Homepage: `app/page.tsx`
- Engagements and employment summaries: `components/portfolio/experience.tsx`
- Contact links: `components/portfolio/experience.tsx` and `components/portfolio/chrome.tsx`
- RAG and verifier case studies: `app/case-studies/`
- Demo behavior: `lib/demo-engine.ts`
- Design and responsive rules: `app/globals.css`

Alignerr and Toptal project descriptions are placeholders. Add reviewed details when available. Internal project names, private task content and unsupported outcome metrics must stay out of the public portfolio. Demonstrations are independent examples; they are not client deliverables. Employer dates were omitted because the supplied resume needs timeline clarification.

`pnpm run build` prepares downloadable copies from the same demo engine and tests used by the website. These copies contain no project secrets.

## Easiest public deployment: GitHub Pages

The included `.github/workflows/deploy-pages.yml` builds the site and publishes `dist/client`.

1. Create a public repository named `<your-username>.github.io` and push this project to its `main` branch.
2. Open repository Settings → Pages and choose GitHub Actions as the source.
3. Run the deployment workflow or push a commit. The workflow reports the site URL.

Use the user-site repository above, or a custom domain served at `/`. Links in this version start at `/`; a repository subpath such as `/portfolio/` needs a base-path change and verification before deployment.

A domain is optional. Buy one later, add it under repository Settings → Pages, then add the DNS records GitHub specifies. Do not add a CNAME until the domain has been purchased and verified.

GitHub Pages supports this static educational portfolio. Adding a paid app, private server endpoints or real model calls will require a separate backend and a review of the hosting terms.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages

## Sites preview

The `.openai/hosting.json` file binds this checkout to its private Sites project. Keep that identifier unchanged. The first deployment is owner-only; a public audience must be chosen before using it as a recruiter-facing URL.

Optional WebMCP tools expose the same RAG and verifier actions when a compatible browser API is available. Ordinary visitors use the visible controls. No browser automation is required to use the site.

Static navigation intentionally uses native anchors, so it does not need an RSC server on GitHub Pages. The Next.js link and legacy pages-font lint rules are disabled for this static build; fonts live in the shared app layout. SVG and canvas visualizations retain explicit accessible image roles.

The build converts flat HTML exports into directory indexes so `/case-studies/graph-rag/` works on a plain static host. This avoids a trailing-slash prerender issue in the pinned vinext release. The build fails if any required route or download is missing.

Validation: the demo logic, type checks, lint and static export are checked locally. Optional WebMCP hooks have not been exercised in a compatible browser context. Browser visual and interaction QA is still pending.
