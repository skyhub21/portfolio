/* ============================================================
   THE ANCIENT SIGNAL — projects.js
   ------------------------------------------------------------
   Central project data for the portfolio archive.

   To add a new project:
     1. Copy one of the example objects below.
     2. Give it a new unique `id` (string, kebab-case recommended).
     3. Replace all values. Do not edit index.html or main.js.

   All image paths are relative to the project root
   (assets/projects/...). Replace placeholder images with your
   own. Example URLs are placeholders — swap in real links.

   The `technologies` array feeds the filter chips and search
   in main.js. Use consistent, human-readable names
   (e.g. "C#", "ASP.NET Core", "Python", "React Native").
   ============================================================ */

/* eslint-disable no-unused-vars */

/**
 * @typedef {Object} Project
 * @property {string}   id            Unique identifier (kebab-case).
 * @property {string}   title         Display title.
 * @property {string}   subtitle      Short supporting line.
 * @property {string}   category      Coarse group (e.g. "Web Application").
 * @property {string}   summary       One-to-two-sentence card summary.
 * @property {string}   description   Longer description for the detail view.
 * @property {string}   purpose       Why the project exists.
 * @property {string}   cover         Cover image path.
 * @property {string[]} gallery       Additional screenshot paths.
 * @property {string[]} technologies  Technology tags.
 * @property {string}   github        Repository URL ("" to hide button).
 * @property {string}   live          Live demo URL  ("" to hide button).
 * @property {string}   status        e.g. "Completed", "In Progress", "Archived".
 * @property {string[]} features      Main features.
 * @property {string[]} challenges    Development challenges.
 * @property {string[]} lessons       Lessons learned.
 */

/**
 * @type {Project[]}
 */
const PROJECTS = [
  /* ----------------------------------------------------------
     EXAMPLE 1 — C# / ASP.NET Core web application
     Replace all placeholder content with your real project.
     ---------------------------------------------------------- */
  {
    id: "signal-dashboard",
    title: "Signal Dashboard",
    subtitle: "A secure admin console for archived telemetry.",
    category: "Web Application",
    summary:
      "An ASP.NET Core dashboard that ingests, stores, and visualises incoming telemetry records with role-based access and paginated data tables.",
    description:
      "Signal Dashboard is an internal admin console built with ASP.NET Core MVC. " +
      "It receives structured telemetry from client services, stores it in SQL Server, " +
      "and exposes a paginated, searchable interface for operators to inspect records, " +
      "filter by signal type, and export reports. Access is gated by role-based " +
      "authorisation, and every mutation is written to an audit log.",
    purpose:
      "Replace manual spreadsheet tracking of incoming telemetry with a single, " +
      "auditable, permission-controlled console.",
    cover: "assets/projects/signal-dashboard-cover.webp",
    gallery: [
      "assets/projects/signal-dashboard-1.webp",
      "assets/projects/signal-dashboard-2.webp",
      "assets/projects/signal-dashboard-3.webp"
    ],
    technologies: ["C#", "ASP.NET Core", "SQL Server", "Razor", "Bootstrap"],
    github: "https://github.com/your-username/signal-dashboard",
    live: "https://signal-dashboard.example.com",
    status: "Completed",
    features: [
      "Role-based authentication and authorisation",
      "Server-side pagination and search over telemetry records",
      "CSV export of filtered result sets",
      "Audit log for every write operation",
      "Responsive Razor views"
    ],
    challenges: [
      "Designing queries that stay fast as the telemetry table grows past a million rows.",
      "Keeping role checks consistent between controllers and Razor views.",
      "Handling large CSV exports without blocking the request thread."
    ],
    lessons: [
      "Server-side pagination is almost always the right default for admin tables.",
      "A small audit layer early on saves a great deal of pain later.",
      "View-layer permission checks should mirror controller checks exactly."
    ]
  },

  /* ----------------------------------------------------------
     EXAMPLE 2 — Python / Flask API
     ---------------------------------------------------------- */
  {
    id: "glyph-parser",
    title: "Glyph Parser",
    subtitle: "A Flask API that decodes structured glyph streams.",
    category: "API / Backend",
    summary:
      "A lightweight Python and Flask API that parses, validates, and normalises encoded glyph streams submitted by client applications.",
    description:
      "Glyph Parser is a small Flask service that accepts encoded glyph payloads " +
      "over JSON, validates them against a documented schema, normalises edge cases " +
      "in the encoding, and returns a structured, canonical representation. " +
      "It includes OpenAPI documentation, request-level rate limiting, and a " +
      "pytest suite covering the parser's happy path and malformed input.",
    purpose:
      "Provide one reliable, documented place for clients to decode glyph data " +
      "instead of re-implementing the parser in every application.",
    cover: "assets/projects/glyph-parser-cover.webp",
    gallery: [
      "assets/projects/glyph-parser-1.webp",
      "assets/projects/glyph-parser-2.webp"
    ],
    technologies: ["Python", "Flask", "Pytest", "OpenAPI", "Docker"],
    github: "https://github.com/your-username/glyph-parser",
    live: "",
    status: "Completed",
    features: [
      "Schema-validated JSON input",
      "Canonical normalisation of encoded payloads",
      "Auto-generated OpenAPI documentation",
      "Request-level rate limiting",
      "Pytest coverage for malformed input"
    ],
    challenges: [
      "Defining a canonical schema that survives all the malformed variants seen in the wild.",
      "Writing tests for ambiguous edge cases before the schema was final.",
      "Keeping response times predictable under concurrent submissions."
    ],
    lessons: [
      "Documenting the contract first made the parser dramatically easier to build.",
      "Malformed-input tests are as valuable as happy-path tests.",
      "A small, focused service is easier to secure and monitor than a large one."
    ]
  },

  /* ----------------------------------------------------------
     EXAMPLE 3 — Vanilla JavaScript / Supabase
     ---------------------------------------------------------- */
  {
    id: "archive-reader",
    title: "Archive Reader",
    subtitle: "A browser-based reader for archived documents.",
    category: "Front-End",
    summary:
      "A static, client-side reader that fetches archived documents from Supabase and renders them in a fast, keyboard-navigable interface.",
    description:
      "Archive Reader is a no-build, vanilla JavaScript application that reads " +
      "document records and signed asset URLs from Supabase. It renders a searchable " +
      "list of documents, opens a focused reading view, and preserves scroll position " +
      "between documents. There is no framework and no bundler — just HTML, CSS, and " +
      "modern JavaScript served as a static site.",
    purpose:
      "Make a curated document archive browsable by non-technical readers " +
      "without maintaining a full web application server.",
    cover: "assets/projects/archive-reader-cover.webp",
    gallery: [
      "assets/projects/archive-reader-1.webp",
      "assets/projects/archive-reader-2.webp",
      "assets/projects/archive-reader-3.webp"
    ],
    technologies: ["JavaScript", "Supabase", "HTML5", "CSS3"],
    github: "https://github.com/your-username/archive-reader",
    live: "https://archive-reader.example.com",
    status: "Completed",
    features: [
      "Search across document titles and tags",
      "Focused reading view with keyboard navigation",
      "Signed URL access to private assets via Supabase",
      "Zero build step — deploy as static files",
      "Reduced-motion and focus-management support"
    ],
    challenges: [
      "Keeping the interface responsive with a very large DOM-less list of results.",
      "Managing Supabase row-level security while still allowing anonymous reads of public documents.",
      "Preserving reading position when moving between documents."
    ],
    lessons: [
      "Modern vanilla JS is more than sufficient for a focused static app.",
      "Row-level security in Supabase is the right place to express access rules.",
      "Small UX details (scroll restore, focus return) matter more than extra features."
    ]
  },

  /* ----------------------------------------------------------
     EXAMPLE 4 — React Native mobile app
     ---------------------------------------------------------- */
  {
    id: "field-notes",
    title: "Field Notes",
    subtitle: "Offline-first note-taking for field researchers.",
    category: "Mobile Application",
    summary:
      "A React Native mobile app for field researchers that captures notes offline and syncs them to a Supabase backend when connectivity returns.",
    description:
      "Field Notes is a React Native application built for low-connectivity " +
      "environments. Notes are captured locally, stored in a small on-device " +
      "database, and queued for synchronisation with a Supabase backend when the " +
      "device regains connectivity. Conflicts are resolved with a last-write-wins " +
      "policy and surfaced to the user for review.",
    purpose:
      "Give field researchers a dependable way to record observations " +
      "without losing work when connectivity is intermittent.",
    cover: "assets/projects/field-notes-cover.webp",
    gallery: [
      "assets/projects/field-notes-1.webp",
      "assets/projects/field-notes-2.webp"
    ],
    technologies: ["React Native", "JavaScript", "Supabase", "SQLite"],
    github: "https://github.com/your-username/field-notes",
    live: "",
    status: "In Progress",
    features: [
      "Offline note capture with local persistence",
      "Background sync queue to Supabase",
      "Conflict review for last-write-wins resolution",
      "Photo attachment support",
      "Large-tap-target, single-hand interface"
    ],
    challenges: [
      "Designing a sync queue that survives app termination mid-upload.",
      "Resolving conflicts fairly without silently overwriting user edits.",
      "Keeping the on-device database small on low-storage phones."
    ],
    lessons: [
      "Offline-first changes the shape of the data model, not just the UI.",
      "Showing conflicts to the user is often better than resolving them silently.",
      "Testing on a real, slow device early saves rework."
    ]
  },

  /* ----------------------------------------------------------
     EXAMPLE 5 — Python data tool
     ---------------------------------------------------------- */
  {
    id: "signal-normaliser",
    title: "Signal Normaliser",
    subtitle: "A batch tool that normalises heterogeneous signal logs.",
    category: "Data / Tooling",
    summary:
      "A Python command-line tool that reads signal logs from multiple heterogeneous sources and emits a single, normalised dataset for downstream analysis.",
    description:
      "Signal Normaliser is a Python CLI that ingests signal logs from several " +
      "legacy formats, applies a documented set of normalisation rules, and writes " +
      "a single tidy dataset suitable for analysis. It is idempotent, resumable, " +
      "and reports row-level diagnostics for anything it could not map cleanly.",
    purpose:
      "Consolidate fragmented legacy log formats into one analysable dataset " +
      "without hand-written per-source scripts.",
    cover: "assets/projects/signal-normaliser-cover.webp",
    gallery: [
      "assets/projects/signal-normaliser-1.webp"
    ],
    technologies: ["Python", "Pandas", "SQL", "CLI"],
    github: "https://github.com/your-username/signal-normaliser",
    live: "",
    status: "Archived",
    features: [
      "Multi-format ingestion with documented mapping rules",
      "Idempotent, resumable runs",
      "Row-level diagnostics for unmapped input",
      "Single tidy output dataset",
      "Configurable via a plain-text rules file"
    ],
    challenges: [
      "Documenting legacy formats that were never fully specified.",
      "Making the tool resumable without duplicating rows.",
      "Keeping the rules file readable for non-developers."
    ],
    lessons: [
      "Spending time on the rules file paid for itself many times over.",
      "Idempotency should be a design goal from the start, not a retrofit.",
      "Good diagnostics turn a data tool from suspicious to trusted."
    ]
  },

  /* ----------------------------------------------------------
     EXAMPLE 6 — Full-stack, in progress
     ---------------------------------------------------------- */
  {
    id: "codex-atlas",
    title: "Codex Atlas",
    subtitle: "A full-stack knowledge atlas for technical notes.",
    category: "Full-Stack",
    summary:
      "An in-progress full-stack application that links technical notes into a browsable atlas of related concepts, built with ASP.NET Core, SQL, and a vanilla JS front-end.",
    description:
      "Codex Atlas is an ongoing project to build a personal knowledge atlas: " +
      "technical notes are stored as structured records, linked by tagged " +
      "relationships, and rendered as a browsable graph. The backend is ASP.NET Core " +
      "with SQL Server; the front-end is vanilla JavaScript with no framework.",
    purpose:
      "Make it possible to navigate technical notes by relationship rather than " +
      "by folder, without adopting a heavyweight knowledge-management tool.",
    cover: "assets/projects/codex-atlas-cover.webp",
    gallery: [
      "assets/projects/codex-atlas-1.webp",
      "assets/projects/codex-atlas-2.webp"
    ],
    technologies: ["C#", "ASP.NET Core", "SQL Server", "JavaScript", "HTML5", "CSS3"],
    github: "https://github.com/your-username/codex-atlas",
    live: "",
    status: "In Progress",
    features: [
      "Structured notes with tagged relationships",
      "Graph-style navigation between linked concepts",
      "Full-text search over note content",
      "Vanilla JS front-end with no build step"
    ],
    challenges: [
      "Keeping graph rendering legible as the number of linked notes grows.",
      "Designing a schema that supports both tree and graph navigation.",
      "Balancing search relevance against simple substring matching."
    ],
    lessons: [
      "Graph UI is easy to overbuild — start with lists and links, add graph later.",
      "A boring, well-indexed schema beats a clever one.",
      "Vanilla JS continues to be a good fit for small, focused interfaces."
    ]
  }
];

/* ------------------------------------------------------------
   Expose the data to the other scripts.

   The other files (main.js, gallery.js) reference `PROJECTS`
   directly because they are loaded as classic scripts in the
   same global scope after this file. The explicit window
   assignment below is a small, harmless convenience that also
   allows future module migration without changing the shape.
   ------------------------------------------------------------ */
window.PROJECTS = PROJECTS;