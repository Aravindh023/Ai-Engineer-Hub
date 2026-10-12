# AI Engineer Field Manual — React app

An interactive learning hub for AI engineering: 11 phases, 169 concepts, each with
a structured **plain-language overview**, an interactive **sub-types explorer** with
selection guidance and worked examples, mechanics, pitfalls, application guidance,
self-test questions, hands-on widgets, and further reading. Progress (mastered
concepts + XP/rank) is saved in your browser and resumes where you left off.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Production build:

```bash
npm run build    # outputs to dist/
npm run preview  # serve the built app
```

## AI Tutor (Ask AI)

A floating **"Ask AI"** tutor ([Assistant.jsx](src/components/Assistant.jsx)) helps clarify doubts about any concept. It works in two modes:

- **Grounded (default, offline, zero setup)** — retrieves the most relevant lesson
  content from the whole curriculum ([searchIndex.js](src/lib/searchIndex.js)) and
  composes a helpful, citation-backed answer. Its replies link straight to the
  matching lessons (agentic navigation) and suggest good follow-up questions.
- **Generative (optional)** — questions are answered by **Claude** (`claude-haiku-4-5`
  by default, Sonnet/Opus selectable), grounded in the retrieved course context
  ([tutor.js](src/lib/tutor.js)). Two ways to enable it:
  - **Server key (recommended):** copy `.env.example` to `.env.local` and set
    `ANTHROPIC_API_KEY`. The dev/preview server's `/api/tutor` proxy
    ([vite.config.js](vite.config.js)) attaches the key server-side, so it never
    reaches the browser or the built JS. Don't use a `VITE_` prefix for the key —
    Vite bundles `VITE_*` variables into client code.
  - **Personal key:** paste a key in the tutor's settings; it is stored only in that
    browser (`localStorage`) and used for direct browser calls.

  The proxy only exists in `npm run dev` / `npm run preview`. A plain static host
  (e.g. GitHub Pages) has no server, so the tutor falls back to grounded mode or a
  personal key there.

It's context-aware: with a lesson open, "explain this simpler" answers about that concept.

## Interactive 3D

Built with **three.js / React Three Fiber**, loaded as a **lazy chunk** so three.js
never weighs down the initial page and degrades gracefully to a placeholder where
WebGL is unavailable ([Viz3D.jsx](src/three/Viz3D.jsx) wraps it in Suspense + an
error boundary).

- **Home hub** — the 11 phases as a rotatable constellation; node colour reflects your
  progress; click a node to jump into that phase.
- **Embeddings** concept — a rotatable 3D point cloud where words cluster by meaning.
- **Transformer** concept — an attention ring: click any token to see what it attends to.

Add a visualizer to another concept via the `VISUALIZERS` registry in
[ConceptView.jsx](src/components/ConceptView.jsx).

## Multi-level deep content (Beginner → Expert)

Every concept carries a deep lesson with three switchable depth levels, concrete
examples, a mini-glossary, and practice questions — rendered by
[DeepContent.jsx](src/components/DeepContent.jsx). Content lives in
[src/data/deep/](src/data/deep/):

- Every **In simple terms** panel explains what the concept means, why it matters,
  and the first practical outcome in short beginner-friendly language.
- All **677 subtype cards** explain meaning, lesson relevance, selection guidance,
  and a concrete example.
- Every major section includes a short instruction explaining how to study or use it.

- `p0.js`, `p1.js` — fully hand-authored lessons for the original Phase 0–1 topics.
- `prerequisites.js` — five additional Python lessons covering fundamentals through
  data pipelines; these are inserted without editing generated content.
- `topic-guidance.js` — topic-specific intermediate and expert guidance for the
  original Phase 2–7 concepts.
- `expansions/` — 106 additional lessons across Modules 0–10, including computing
  and data foundations, ML/PyTorch, production API engineering, full RAG operations,
  durable agents, evaluation science, cloud/SRE, frontier ML, AI product design,
  MLOps/platform engineering, professional practice, and ten capstones.
- `index.js` combines authored and generated material into the same deep-content
  schema, so all 169 concepts expose Beginner, Intermediate, and Expert levels.

## Study-time roadmap

Every lesson sub-module now has an estimated study range. The home screen
calculates the lesson-only curriculum total and three study plans automatically.
Capstone and portfolio project hours are intentionally excluded. Current total:

- **588–1,037 study hours**.
- **98–173 focused study days** at six hours per day.
- Roughly **5–9 months** at 30 study hours/week, **10–17 months** at
  15 study hours/week, or **18–30 months** at 8 study hours/week.

These are active study estimates, not passive reading time. Allow separate time for
capstones, portfolio projects, revision, feedback, and interview preparation.

## Job Readiness Lab

The application now separates lesson completion from demonstrated job readiness.
The **Job Readiness Lab** is available from the home page, top bar, and command
palette and stores its evidence locally in the browser.

- Four role-specific tracks: Applied AI/LLM Engineer, ML Engineer, MLOps/AI
  Platform Engineer, and Research Engineer.
- Contract-autograded Python, SQL, ML-metric, data-structure, and algorithm tasks.
- Timed debugging exercises with hidden requirement checks.
- Scored AI system-design cases covering requirements, architecture, evaluation,
  security, operations, cost, and failure handling.
- Production incident drills for RAG, agents, evaluation drift, latency, cost, and
  prompt injection; unsafe response choices reduce the score.
- Evidence-based capstone rubrics that require an inspectable repository and
  criterion-level links or explanations.
- Thirty-minute mixed mock interviews with theory, design, debugging, project
  presentation, and behavioural questions.
- A separate 0–100 readiness score. Reading or marking a lesson complete does not
  increase it; only passed assessments and project evidence count.

Content schema per concept:

```js
{
  levels: { beginner: '<html>', intermediate: '<html>', expert: '<html>' },
  examples: [{ title, lang, code, note }],
  glossary: [{ term, def }],
  practice: [{ q, a }],
}
```

## How it's structured

```
index.html                     App shell + <script src> for the legacy widget bridge
scripts/extract-content.mjs    Regenerates data from the original single-file HTML
public/legacy-widgets.js       (generated) interactive widget code, runs as a classic
                               script so its functions register on window
src/
  data/
    content.js                 (generated) base PHASES + DIAGRAMS, extracted verbatim
    curriculum.js              merges hand-authored additions into base PHASES
    catalog.js                 combined beginner/extras lookups
    prerequisites.js           complete Python prerequisite learning path
    expansions/                comprehensive Module 0–10 additions and capstones
    clarity.js                 plain-language overview and subtype explanation layer
    jobReadiness.js            role tracks, assessments, rubrics, and interview bank
    studyPlan.js               per-concept hours + full-time/balanced/part-time plans
    extras.js                  definitions + sub-types + examples per concept (hand-authored)
    model.js                   flattened concepts + XP / rank system
  hooks/useProgress.js         localStorage-backed progress state
  components/
    Sidebar.jsx                phase nav, search, progress
    Home.jsx                   dashboard, rank banner, phase path, reset
    ConceptView.jsx            a full lesson (definition → sub-types → body → …)
    SectionIntro.jsx           consistent short guidance for each lesson section
    JobReadinessLab.jsx        readiness dashboard and role-specific graduation gates
    readiness/                 coding, design, incident, capstone, and mock-interview UIs
    SubtypesExplorer.jsx       the interactive tabbed sub-type/example widget
  App.jsx                      routing between home and concept views
  styles.css                   design system + AI-themed polish
```

### Content pipeline

The original 58 concepts' lesson bodies, diagrams, and interactive widgets were
extracted **verbatim** from the original `ai_engineer_learning_hub_2.html` (kept one
directory up) to guarantee fidelity — nothing was retyped. If you edit that source,
re-run:

```bash
npm run extract
```

The **definitions and sub-types/examples** in `src/data/extras.js` are the original
hand-authored layer. New prerequisite concepts belong in `src/data/prerequisites.js`;
Module 0–10 additions belong in `src/data/expansions/`. Both are merged through
`curriculum.js`, so running the extractor cannot erase them.

### Why a classic script for widgets

The original widgets are imperative DOM code, and concept bodies contain inline
`oninput`/`onclick` handlers that call them by name. Loading that code as a classic
(non-module) script registers its top-level functions on `window`, so those inline
handlers resolve correctly. `ConceptView` injects each body via
`dangerouslySetInnerHTML` and calls `window.WIDGET_INIT[conceptId]()` after mount.
