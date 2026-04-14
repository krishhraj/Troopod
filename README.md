# 🎯 Landing Page Personalizer

A CRO-driven, AI-powered tool that takes an **Ad Creative** and a **Landing Page URL**, then rewrites the page's key conversion elements to perfectly match the ad's message — using strict CRO principles and Claude AI.

---

## ✨ Features

- **Message-Match Engine** — Rewrites H1, subheadings, CTAs, and meta to mirror your ad's hook
- **Zero Layout Risk** — Only text nodes are rewritten; HTML structure, CSS classes, and design are untouched
- **Hallucination-Safe** — Strict system prompt prevents the AI from inventing features or claims
- **Deterministic Output** — `temperature: 0` ensures repeatable, consistent transformations
- **Before & After Diff** — See exactly what changed and why, with CRO rationale per element
- **Live iframe Preview** — View the personalized page rendered in a sandboxed iframe
- **One-click Download** — Export the personalized HTML file

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set your API key

Copy `.env.local` and add your Groq API key:

```bash
cp .env.local .env.local
```

Edit `.env.local`:
```
Groq_API_KEY=sk-ant-your-key-here
```


### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

```
landing-personalizer/
├── app/
│   ├── api/
│   │   └── personalize/
│   │       └── route.ts        # POST API — scrape → parse → LLM → inject
│   ├── globals.css             # Japandi Tech design system
│   ├── layout.tsx              # Root layout with Playfair + Inter fonts
│   └── page.tsx                # Main dashboard (client component)
│
├── components/
│   ├── InputForm.tsx           # Ad creative + URL inputs with validation
│   ├── LoadingOrb.tsx          # Animated multi-stage loading indicator
│   ├── BeforeAfterDiff.tsx     # Element-level change comparison
│   └── ResultsPanel.tsx        # Tabbed results: diff view + iframe preview
│
├── lib/
│   ├── scraper.ts              # Cheerio-based HTML scraper + safe DOM injector
│   ├── personalizer.ts         # Anthropic API call with strict JSON schema
│   └── utils.ts                # Utility helpers
│
├── types/
│   └── index.ts                # All shared TypeScript types + loading stages
│
├── tailwind.config.ts          # Japandi color palette + custom utilities
└── .env.local                  # API key config
```

---

## 🔒 Safety Architecture

### 1. No HTML Injection
The LLM is instructed to return **plain text values only** in a strict JSON schema. Before values are accepted, a regex validation checks for any `<tag>` patterns and throws if found.

```ts
const htmlTagRegex = /<[^>]+>/;
// throws if LLM injects any HTML
```

### 2. Fact Fidelity
System prompt explicitly forbids:
> "NEVER invent new features, statistics, or claims. Only use facts present in the original page content OR the ad creative."

### 3. Deterministic Output
```ts
temperature: 0,  // Zero randomness
```
Every run on the same inputs produces the same output.

### 4. Safe DOM Injection
`injectPersonalizedContent()` in `lib/scraper.ts` uses Cheerio to set `.text()` — never `.html()` — on matched elements, so injected content is always treated as a text node, never parsed as markup.

---

## 🎨 Design System: Japandi Tech

| Token | Value | Usage |
|-------|-------|-------|
| `--walnut` | `#5C4033` | Primary text, accents |
| `--forest` | `#2E4F4F` | Success states, "after" diffs |
| `--sand` | `#F5F5F0` | Page background |
| `--amber` | `#C8941A` | CTAs, progress, highlights |

Key patterns:
- **Glass panels** — `backdrop-blur` + warm white fill for floating card feel
- **Wood-grain cards** — subtle linear gradient simulating warm wood
- **Playfair Display** — serif for all headers; **Inter** for UI text
- **Framer Motion** — staggered reveals, animated loading orb, tab transitions

---

## 🧪 Testing

Try these publicly accessible URLs:

- `https://vercel.com` + ad: *"Deploy your Next.js app in 30 seconds — zero config, instant previews"*
- `https://stripe.com` + ad: *"Accept payments worldwide in minutes — no hidden fees, instant payouts"*
- `https://linear.app` + ad: *"Your team ships 2x faster with Linear — built for modern engineering teams"*

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| HTML Parsing | Cheerio |
| AI | Anthropic Claude (claude-sonnet-4) |

---

## 🚧 Known Constraints

- Pages behind authentication, CORS restrictions, or Cloudflare bot protection may fail to scrape
- Very JavaScript-heavy SPAs may not expose meaningful text in their initial HTML — a headless browser (Puppeteer) would be needed for those
- The iframe sandbox (`allow-same-origin` only) prevents external scripts from running in the preview

---

## 📄 License

MIT
