# Uday — AI Fieldnotes

A static portfolio for Uday Kondreddy. The site uses React, TypeScript, vinext and the Sites component library.

The homepage presents a chronological career timeline, followed by freelance work and the learning library. Each employer links to a dedicated work page at `/experience/<company>/`.
Eight challenge-led architecture deep dives live under `/projects/`. There is no repeated project grid on the homepage.
Project previews show reported impact from the supplied resumes. ServiceNow's 60% figure refers to manual triage time, not MTTR. The SWYM recommendations page links to the upstream Recommenders library supplied by Uday.
Three recurring stick-figure illustrations accompany building, learning and explaining. Their original assets and generation prompts are documented in `docs/illustrations.md`.

The site has no embedded chats, evaluation controls or interactive playgrounds. It does not need an API key, Docker or OmniRoute.

## Develop

Use Node.js 24 and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm run typecheck
pnpm run build
```

The build writes the static site to `dist/client`. Google Fonts supplies the typefaces. Local font fallbacks are available.

For a preview of the build, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist/client
```

Open <http://127.0.0.1:4173/projects/>.

## Learning library

The `/learning/` page presents separate GenAI and Agentic AI series. Each card includes its original cover and summary.
Series cards and filters help readers choose a path. Search matches titles, summaries, topics and lesson numbers.
Lesson numbers stay fixed when readers search or filter. All counts come from the files present.
Select a cover, title or Read module button to open the reader popup. Close it with the × button or Escape.
The reader renders PDF pages inside the site, keeps keyboard focus within the popup and returns focus when you close it.
Use the page selector or previous/next buttons to move through a document. Zoom from Fit width to 200%; wide pages scroll horizontally.
You can download the original PDF from the card or reader. Pages render as you scroll to limit memory use.
The build prepares PDF.js assets locally; the reader does not send documents to an external viewer.
The homepage includes a preview after the production projects. Counts come from the PDF files in `public/learning/`.

To add a module:

1. Copy the PDF into `public/learning/`. Use a unique filename such as `GenAI - 31.pdf` or `Agentic - 13.pdf`.
2. Run `pnpm run content:sync`, or keep `pnpm run content:watch` running while you add files.
3. Open the learning page. An open page refreshes the collection within 30 seconds, or when you return to the tab.

New PDFs appear without metadata. Their filenames become titles. Numbers in filenames set the default reading order.
The `GenAI` and `Agentic` filename prefixes select the series automatically. Other files appear under Fieldnotes.
You can set `series` in the optional metadata to assign any series name, including a new series.
Only PDFs directly inside `public/learning/` enter the collection. Subfolders and other files are ignored.
When you remove a PDF, the next sync removes its card and preview copy.

For a title, summary, topics and page count, add an entry to `content/learning-notes.json`. Use the exact PDF filename as the key:

```json
{
  "Agentic - 13.pdf": {
    "title": "Your lesson title",
    "summary": "A short description of the lesson.",
    "topics": ["Topic one", "Topic two"],
    "pages": 10,
    "series": "Agentic AI",
    "lesson": 13,
    "order": 13,
    "cover": "agentic-13.png"
  }
}
```

All fields are optional. If you add a cover, place the image in `public/learning/covers/`. Cards without a cover use a title panel.
Builds, syncs and the watcher generate WebP thumbnails at up to 320, 640 and 960 pixels wide, without upscaling. Cards request the appropriate size for the screen.
Replacing a cover generates new image URLs. Original images and PDFs are preserved. Generated thumbnails live in `public/learning/covers/thumbnails/`.
The supplied covers preserve the `@learn.machinelearning` attribution. The original PDFs remain unchanged.

The watcher updates the local static preview and generated catalogs. It does not publish files to a hosted site.
For a hosted update, commit the PDF and optional metadata, then deploy. Every build regenerates the collection automatically.
GitHub Actions runs the build on a push to `main` when you use the included Pages workflow.

Run `node --test tests/learning-library.test.mjs` to check discovery, ordering, metadata and preview synchronization.

## Edit content

| Content                               | File                                  |
| ------------------------------------- | ------------------------------------- |
| Project summaries and contributions   | `lib/projects.ts`                     |
| Project cards and case-study layout   | `components/portfolio/projects.tsx`   |
| Homepage                              | `app/page.tsx`                        |
| Professional and freelance experience | `components/portfolio/experience.tsx` |
| Navigation                            | `components/portfolio/navigation.tsx` |
| Learning PDFs and cover images        | `public/learning/`                    |
| Optional learning module descriptions | `content/learning-notes.json`         |
| Learning cards and collection page    | `components/portfolio/learning.tsx`   |
| Colors and layout                     | `app/globals.css`                     |

The project summaries come from the supplied resumes. Architecture diagrams are public sketches of documented components; they do not expose exact internal interfaces.
Edit `content/architecture.json` to change a diagram. The build generates downloadable SVGs with `scripts/prepare-architecture.mjs`.
Six deep dives link to synthetic evaluation companions in `public/artifacts/evaluation/`. These examples score saved fictional outputs. They do not execute the original systems or support historical impact figures. The downloadable ZIP includes the script, fixtures, metric definitions, tests and example reports. The two Dhan AI project pages summarize the confirmed work and include architecture sketches; implementation repositories and evaluation artifacts have not been supplied for those projects.
Run `python3 -m unittest -v test_evaluate_outputs.py` from that artifact directory to check it. Real employer recordings and sanitized implementation repositories have not been supplied.

Alignerr and Toptal descriptions remain placeholders. Project summaries omit private deliverables and internal task names. Confirmed reported metrics appear on the relevant previews; ambiguous revenue and deployment figures remain omitted.
The Expertquery summary describes the authoring workflow in the supplied guidelines. It does not claim task approvals or platform-wide results.
Career dates incorporate Uday's corrections: Synopsys ran from October 2018 to May 2020, followed by Dhan AI in Hyderabad from May 2020 to May 2021. SWYM started in June 2021 and ended in June 2022. The Dhan AI role covers LUIS/Bot Framework virtual assistants, a Rasa hospital help-desk chatbot, and ClinicalBERT adaptation work.

The old lab URLs show the project collection for existing bookmarks. The old RAG URL shows the enterprise retrieval project. The evaluation URL shows a freelance work overview.

## Publish with GitHub Pages

The included workflow builds the site and publishes `dist/client`.

Deployment target: <https://udaykondreddy-crypto.github.io/>.
GitHub repository: <https://github.com/udaykondreddy-crypto/udaykondreddy-crypto.github.io>.
The `github` remote points to that repository; the existing `origin` remains the Sites source repository.
Push new commits with `git push github main`. GitHub Actions checks the source, rebuilds the learning catalog, and publishes the site.

1. Create a repository named `<your-username>.github.io`.
2. Push this project to its `main` branch.
3. In repository Settings → Pages, select GitHub Actions.
4. Run the deployment workflow.

The workflow reports the site URL. Links start at `/`, so this configuration needs a user-site repository or a custom domain.

A domain is optional. If you purchase a domain, add it in repository Settings → Pages. Then configure the DNS records that GitHub specifies.

[GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) explains the hosting options.

## Existing Sites project

The `.openai/hosting.json` file identifies the existing private Sites project. Its earlier publication failed during sign-in configuration. GitHub Pages is now the selected public hosting target; the Sites configuration remains available for that separate deployment path.

The build converts exported pages into directory indexes. It checks all project pages and required assets before completion.

## Earlier experiments

Earlier lab components, server code and tests remain in the source for possible reuse. No current page imports those controls. The portfolio preview uses a static server.

The ignored `.local` directory contains the earlier gateway installation and saved sessions. The source archive excludes that directory and all credentials.

`docs/local-lab.md` contains historical setup notes. Those notes do not describe the current portfolio interface.
