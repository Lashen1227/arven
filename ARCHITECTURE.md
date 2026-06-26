# arven — Architecture

> This document explains how arven is structured internally, how data flows through the system, and why each decision was made.

---

## Overview

arven operates in two distinct modes:

| Mode | Trigger | Purpose |
|------|---------|---------|
| **On-demand** | Developer runs `arven <command>` | Generate, diff, check `.env.example` |
| **Always-on** | Every `git commit` | Guard staged files, block if vars are undocumented |

Both modes share the same core scanning engine — only the input source differs.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Developer                                │
└───────────────────────┬─────────────────────┬───────────────────┘
                        │                     │
              runs a command            runs git commit
                        │                     │
                        ▼                     ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│       CLI Entry Point     │   │     .git/hooks/pre-commit       │
│     src/bin/arven.ts      │   │     (installed by arven init)   │
└───────────┬───────────────┘   └──────────────┬──────────────────┘
            │                                  │
            │  routes to command               │  calls
            ▼                                  ▼
┌───────────────────────────────────────────────────────────────┐
│                        Commands Layer                         │
│                                                               │
│  init.ts   generate.ts   check.ts   diff.ts   guard.ts       │
│                                             uninstall.ts      │
└────────────────────────┬──────────────────────────────────────┘
                         │
           uses shared core modules
                         │
         ┌───────────────┼──────────────────┐
         ▼               ▼                  ▼
┌──────────────┐  ┌─────────────┐  ┌──────────────────┐
│  scanner.ts  │  │ envParser.ts│  │ hookManager.ts   │
│              │  │             │  │                  │
│ Scans files  │  │ Parse, group│  │ Install/remove   │
│ for env vars │  │ and render  │  │ git pre-commit   │
│              │  │ .env.example│  │ hook             │
└──────────────┘  └─────────────┘  └──────────────────┘
```

---

## Core Modules

### `src/scanner.ts`

The heart of arven. Responsible for finding every env var reference in source files.

**Two scan modes:**

```
scanEnvVars(rootDir)
  └── Scans ALL source files in the project
  └── Used by: generate, check, diff, guard (full scan fallback)

scanStagedFiles(stagedFiles[], rootDir)
  └── Scans ONLY the files passed by the git hook
  └── Used by: guard (fast path — only checks what changed)
```

**Detection patterns:**

| Pattern | Covers |
|---------|--------|
| `process.env.VAR` | Node.js, Express, NestJS |
| `process.env['VAR']` | Node.js bracket notation |
| `import.meta.env.VAR` | Vite, SvelteKit, Next.js |
| `Deno.env.get('VAR')` | Deno |
| `Bun.env.VAR` | Bun |

**Output:** `ScanResult` — a `Map<string, Set<string>>` where each key is a var name and the value is the set of files it was found in.

**Built-in exclusions:** `NODE_ENV`, `PATH`, `HOME`, `CI`, `TZ` and other system vars are filtered out automatically.

---

### `src/utils/envParser.ts`

Three focused utilities:

```
parseEnvExample(filePath)
  └── Reads an existing .env.example
  └── Returns Set<string> of declared var names
  └── Skips comments (#) and blank lines

groupByCategory(varNames[])
  └── Takes a flat list of var names
  └── Matches against 10 category rules (regex patterns)
  └── Returns GroupedVars — Map<label, varName[]>
  └── Unmatched vars fall into "General"

renderEnvExample(groups)
  └── Takes GroupedVars
  └── Returns a formatted .env.example string
  └── Includes arven attribution header and Welsh origin line
```

**Category rules** match on var name prefixes:

```
Database        → DB_, DATABASE_, MONGO, POSTGRES, REDIS …
Auth & Security → JWT_, AUTH_, SECRET, PASSWORD …
Cloud & Storage → AWS_, S3_, AZURE_, CLOUDFLARE_ …
Email           → SMTP_, MAIL_, SENDGRID_, RESEND_ …
Payments        → STRIPE_, PAYPAL_, LEMON_ …
AI / LLM        → OPENAI_, ANTHROPIC_, GEMINI_ …
Frontend/Public → NEXT_PUBLIC_, VITE_, REACT_APP_ …
Server          → PORT, HOST, BASE_URL, API_URL …
OAuth           → GOOGLE_, GITHUB_, DISCORD_ …
Monitoring      → SENTRY_, DATADOG_, LOGTAIL_ …
General         → everything else
```

---

### `src/hooks/hookManager.ts`

Manages the git pre-commit hook lifecycle.

```
findGitDir(from)
  └── Walks up the directory tree to find .git/
  └── Returns null if not inside a git repo

installHook(projectRoot)
  └── Finds .git/hooks/pre-commit
  └── If file doesn't exist → writes fresh hook script
  └── If file exists without arven marker → appends arven block
  └── If arven already installed → no-op
  └── chmod 755 to make hook executable

uninstallHook(projectRoot)
  └── Reads pre-commit hook
  └── Finds arven marker line
  └── Slices out the arven block
  └── If arven was the only entry → deletes the file entirely
```

**Hook marker** — every arven block starts with:
```sh
# arven:pre-commit
```
This marker is how arven identifies its own code inside the hook file, making install/uninstall safe and idempotent.

**Compatibility with other tools:** If `husky` or another tool has already written a pre-commit hook, arven appends to the end rather than overwriting — both tools coexist safely.

---

## Command Flows

### `arven init`

```
init
  ├── installHook()
  │     ├── findGitDir()
  │     ├── write/append .git/hooks/pre-commit
  │     └── chmod 755
  │
  └── scanEnvVars(root)
        ├── glob all source files
        ├── run all PATTERNS against each file
        ├── groupByCategory(varNames)
        ├── renderEnvExample(groups)
        └── writeFileSync(.env.example)
```

---

### `arven generate`

```
generate
  └── scanEnvVars(root)
        ├── glob → read → regex match
        ├── groupByCategory()
        ├── renderEnvExample()
        └── writeFileSync(.env.example)
```

---

### `arven check` (CI mode)

```
check
  ├── scanEnvVars(root) → codebaseVars (Set)
  ├── parseEnvExample(.env.example) → documented (Set)
  │
  ├── missing = codebaseVars - documented
  ├── unused  = documented - codebaseVars
  │
  ├── if (missing || unused) → print report, exit(1)
  └── else → print ✓, exit(0)
```

Exit code `1` makes this suitable for CI pipelines — any sync issue fails the build.

---

### `arven diff`

Same logic as `check` but:
- Never calls `process.exit(1)`
- Always prints the full picture even when in sync
- Designed for human reading, not CI automation

---

### `arven guard` (called by git hook)

This is the always-on path — runs on every `git commit`.

```
Git commit triggered
  │
  ▼
.git/hooks/pre-commit
  │  captures: git diff --cached --name-only
  │  passes staged file list to:
  ▼
arven guard --staged "src/auth.ts src/payments.ts ..."
  │
  ├── scanStagedFiles(stagedFiles, root)
  │     └── only scans the files that changed
  │
  ├── parseEnvExample(.env.example) → documented (Set)
  │
  ├── missing = stagedVars - documented
  │
  ├── if missing.length === 0 → exit(0) silently ✓
  └── if missing.length > 0  → print blocked message, exit(1) ✗
```

**Why scan only staged files?**
Scanning the entire codebase on every commit would be slow. By scanning only staged files, arven catches vars introduced in the current commit without re-checking files that haven't changed.

---

## Data Flow Diagram

```
Source Files (.ts / .js / .vue / .svelte)
        │
        │  regex patterns × 5
        ▼
   ScanResult
   Map<varName, Set<filePath>>
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
  groupByCategory()                   parseEnvExample()
   GroupedVars                         Set<varName>
   Map<label, varName[]>                    │
        │                                   │
        ▼                                   ▼
  renderEnvExample()              Set difference (missing / unused)
   string (.env.example)                    │
        │                                   ▼
        ▼                           generate / check / diff / guard
  writeFileSync()                       output + exit code
```
---

## Design Decisions

**Why Node's built-in test runner?**
Zero additional dependencies. `node --test` is available in Node 20+ which is already the minimum engine requirement.

**Why `glob` for file discovery?**
Handles ignore patterns cleanly with a battle-tested API. The alternative (manual `fs.readdir` recursion) would require significantly more code and edge-case handling.

**Why append to existing hooks instead of replacing?**
Replacing a hook file would silently break `husky`, `lefthook`, or any other tool a team already uses. Appending is safe and respectful of the developer's existing setup.

**Why scan only staged files in guard?**
Performance. A full codebase scan on every commit adds noticeable latency. Staged-only scanning is near-instant and catches exactly what matters — the vars introduced in this commit.

**Why exit(0) silently on clean commits?**
Noise kills adoption. If arven printed a message on every clean commit, developers would uninstall it. Silent success, loud failure — the right balance for a git hook.

**Why `NodeNext` module resolution in tsconfig?**
`NodeNext` is the only mode that correctly handles `.js` extensions in ESM imports (required when TypeScript compiles to native ESM). It also enforces correct import behaviour at compile time.

---

## Extension Points

arven is designed to be extended without breaking existing commands:

| What to add | Where |
|-------------|-------|
| New env var syntax (e.g. `env.get('VAR')`) | `PATTERNS` array in `scanner.ts` |
| New category group (e.g. `Blockchain`) | `CATEGORY_RULES` array in `envParser.ts` |
| New built-in exclusion | `BUILT_INS` set in `scanner.ts` |
| New command (e.g. `arven report`) | New file in `src/commands/`, registered in `src/bin/arven.ts` |
| New file type to scan (e.g. `.astro`) | `FILE_GLOBS` array in `scanner.ts` |

---

## Build Pipeline

```
src/**/*.ts
     │
     │  tsc (NodeNext, ES2022)
     ▼
dist/**/*.js   + .d.ts + .js.map + .d.ts.map
     │
     │  npm publish
     ▼
registry → npm install -g @lashen-martino/arven → arven CLI available globally
```

The `dist/` folder is what gets published to npm. Source TypeScript files are excluded via `.npmignore` (or the `files` field in `package.json` if added).
