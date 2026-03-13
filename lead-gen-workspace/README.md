# Local Lead Gen Workspace

A highly functional, completely local web application for orchestrating lead generation, campaigns, sequence generation, and human-in-the-loop approvals.

## 🚀 Getting Started

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

   *(If port 3000 is occupied, it usually runs on 3001 or 3002)*

3. **Open the Application**
   Navigate to [http://localhost:3000](http://localhost:3000) inside your browser. The database (`lead-gen.db`) will be automatically seeded via the `/api/seed` logic the first time you ran it (or you can hit `/api/seed` in your browser to seed manually).

## 🛠 Features

- **Local Lead Datastore:** Built exclusively with SQLite locally (`better-sqlite3`). It is highly scalable, lightning-quick, and allows structured aggregations.
- **CSV Mass Imports:** Import massive datasets using intelligent PapaParse mappings directly into your browser.
- **Duplicate Detection Logic:** Prevents double imports by cross-referencing Domain, Company+City combination, Email, or Telephone number.
- **Strategy & Sequence Generation:** Generates campaign-specific context and email sequences with `{{placeholder}}` mapping. *(Currently mocked locally, perfectly structured for future LLM hook-in)*.
- **Approval Engine:** Leads are queued into a Pipeline. Approving a campaign moves leads into "approved".

## 📦 Data Storage

All data is stored inside a highly optimized SQLite database generated at the root of the workspace: **\`lead-gen.db\`**. You can simply copy this file anywhere, or open it with DB Browser for SQLite. No external or paid dependencies are required.

## 🤖 What is Mocked vs Functional?

**Fully Functional:**
- Complete Database persistence and CRUD.
- Aggregation for Dashboard stats.
- CSV parsing, importing, deduplication.
- API endpoints for routing, tasks, and state-transitions.
- Clean and stunning Vanilla CSS component framework.

**Mocked (Ready for Agents later):**
- **Strategy & Sequence Generation:** When viewing a campaign detail page, the "Generated Strategy" and "5-Touch Sequence" uses mock logic derived from the campaign inputs (it replaces variables properly, but the underlying copy isn't dynamically LLM-authored yet).
- **Enrichment Actions:** Statuses exist for `enriched` and `needs_review`, but actual live scraping is disabled. You can update this later in `api/leads` to hook into Apollo/Hunter or a web crawler.

## 🔌 Integration Points Prepared

The following adapters are ready to be built out when going live:
1. `src/app/api/campaigns/[id]/route.js` -> Overwrite `generateMockSequence` with an OpenAI/Gemini call wrapper.
2. `src/app/api/leads/import/route.js` -> Easily intercept inserted leads and trigger local async background enrichment scripts.
3. `src/lib/db.js` -> Already prepared for a seamless Postgres transition via Prisma if desired later.
