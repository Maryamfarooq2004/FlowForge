# FlowForge — Cleanup Plan

> **Status: DRAFT, waiting for approval.** No code has changed. This file is the only thing created.
> Written 2026-09-26 from a fresh, read-only look at the working tree on `main` (HEAD `53f5b9f`, 2026-05-12).
> I treated the code as the source of truth. The docs in `../planning/`, `../handoff.md` and `CLAUDE.md` were only used as leads.
>
> Commands use **Git Bash** syntax and run from `FYP_implemenation/FYP_implemenation/` (the git root)
> unless they start with `cd server`.

---

## 0. Baseline (measured 2026-09-26, not copied from the audit)

| Check | Command | Result |
|---|---|---|
| Frontend typecheck | `npx tsc -b` | **0 errors** (exit 0) |
| Backend typecheck | `cd server && npx tsc --noEmit` | **0 errors** (exit 0) |
| Frontend lint | `npx eslint src` | **103 errors, 9 warnings** across 142 files |
| Backend tests | `cd server && npx jest` | **13 suites / 164 tests, all passing**, 2 snapshots, 86 s. ⚠ "A worker process has failed to exit gracefully" (an open-handle leak) |
| Frontend audit | `npm audit --omit=dev` | **5 vulns: 2 high** (axios, form-data), **3 moderate** (react-router / @remix-run/router) |
| Backend audit | `cd server && npm audit --omit=dev` | **10 vulns: 1 critical** (tar via @mapbox/node-pre-gyp), **4 high** (incl. `xlsx`, **no fix on npm**; nodemailer), **5 moderate** (qs, uuid, …) |
| Git state | `git status --porcelain` | **149 paths**: 72 modified, 10 deleted, 67 untracked (incl. all of `server/src/generation/`) |
| Backend `any` | `grep -rEo ":\s*any\b\|as any\b\|<any>\|any\[\]" server/src` | **168** type-position uses (127 outside tests). Bare-word `any`: 220 |
| Frontend `any` | ESLint `no-explicit-any` | **35** |
| Dead frontend code | import-graph sweep (every `src/**` file with zero importers) | **19 files / 2,918 lines**, exactly the audit's list |
| Dead backend code | same sweep over `server/src` | `debug.controller.ts` (55), `utils/logger.utils.ts` (49), `utils/response.utils.ts` (used only by dead debug controller), `config/constants.ts`, `routes/health.routes.ts`, `types/api.types.ts` (1-line stubs), `generation/stages/index.ts` |
| `console.log/debug` | grep, excl. generator templates | backend **42**, frontend **1** (dev-gated, `src/lib/axios.ts:35`) |
| CI | `.github/` | **none** |

### ESLint breakdown (baseline)
| Rule | Count | Where |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 35 err | spread |
| `react-refresh/only-export-components` | 29 err | 28 in `src/app/router.tsx` (30 errors total in that file) |
| `@typescript-eslint/no-unused-vars` | 22 err | spread |
| `react-hooks/set-state-in-effect` | 8 err | `CloseEndedForm:61`, `CreateProjectModal:21`, `LoginPage:38`, `ProjectHubPage:29`, `SettingsPage:44`, `AlertsSetupPage:33`, `ThemeStudioPage:35,43` |
| `react-hooks/purity` | 8 err | all `AuthLayout.tsx:42-45` (`Math.random()` in render, so decorative particles re-randomise on every render) |
| `react-hooks/exhaustive-deps` | 7 warn | `AuthInitializer:44`, `CloseEndedForm:83`, `GenerationArtifactsPage:129`(×2), `GenerationLogsPage:35`, `GuidedIntakePage:98`, `LandingPage:143` |
| `react-hooks/incompatible-library` | 2 warn | `RegisterPage:48`, `ResetPasswordPage:49` (RHF `watch()`) |
| `no-case-declarations` | 1 err | `LoginPage:68` |

---

## 1. Verification of the "Known issues" list

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | ~163 uncommitted files; last commit months old | **PARTIAL** | **149** paths (72 M / 10 D / 67 ??), not 163. Last commit `53f5b9f` is **2026-05-12**, 4½ months ago. ⚠ `server/uploads/` (real user uploads: `doc_*.xlsx`, `doc_*.csv`) is untracked and **not gitignored**, so a blind `git add -A` would commit user data. |
| 2 | ~2,900 lines of dead frontend code | **CONFIRMED** | All 19 files have zero importers. Total **2,918** lines: LandingPage 769, ProjectSettingsPage 291, InfrastructurePage 239, 8× `GeneratedApp*` 1,165 (`GeneratedAppShell` is not even used by its siblings), `ui/{Card 44, Badge 45, StatusBadge 44, Slider 93}`, `shared/{Stepper 67, OnboardingEmpty 78, RouteError 82}`, `assets/logo-data.ts` 1 (one very long line). Only `GeneratedAppLogin` is live (`AppPreviewPage.tsx:10,174`). `router.tsx` has **no `errorElement` anywhere**, so wiring in `RouteError` is worth doing. |
| 3a | SupportPage submit is fake | **CONFIRMED + worse** | `src/pages/hub/SupportPage.tsx:112` `await new Promise(r => setTimeout(r, 1500))` then shows success. The FAQ also makes false claims: image uploads (`:18`; `upload.middleware.ts:58` only takes xlsx/xls/csv/pdf), custom domains (`:30`; not built), "5–10 minutes" pipeline. |
| 3b | WorkflowsOverviewPage hardcoded + `/blueprint` 404 | **CONFIRMED** | `src/pages/notifications/WorkflowsOverviewPage.tsx:27` `WORKFLOW_STATES`, `:35` `STATE_DETAILS`, rendered at `:159,191`. `:267` navigates to `/project/:id/blueprint`, but `router.tsx:132` defines only `project/:projectId/spec`, so that link goes to NotFound. |
| 3c | Preview UI Assistant is a placeholder | **PARTIAL** | `AppPreviewPage.tsx:180-200` is **already honestly labelled** ("arrives in a later phase", disabled input, "coming soon"). It is not a fake. The plan leaves it and only checks the label wording. |
| 3d | GeneratedAppLogin uses a setTimeout | **CONFIRMED** | `GeneratedAppLogin.tsx:44-48`: "Simulate login error for preview purposes". **Every** login attempt fails after 1.2 s. |
| 3e | *(new)* Infrastructure route | **NEW** | `router.tsx:95` has an inline "Infrastructure (Coming Soon)" `<div>` route, while the real `InfrastructurePage.tsx` is dead. Honest, but an orphan. |
| 3f | *(new)* Admin API-usage page is wrong | **NEW** | `AdminApiUsagePage.tsx:30` says "Google Gemini is not configured (no API key)", which is false because Gemini is live. |
| 4 | ESLint 103 err + 9 warn; tsc passes; ~162 backend `any` | **CONFIRMED / PARTIAL** | Rule counts match exactly (see §0). The react-hooks part is **16 errors + 9 warnings**, not "~23 errors". Backend `any` is **168** (127 non-test). Also: `eslint.config.js:9` ignores only `dist`, so `npm run lint` (`eslint .`) also walks `server/` and `server/generated-workspaces/`. The backend has **no lint config of its own**. |
| 5 | Repo junk | **CONFIRMED, with corrections** | **Tracked in git:** `server/tsc_errors.txt`, `test-register.js`, `debug_logo.png`, plus `build_errors*.txt` (already deleted in the working tree). **Not tracked (already ignored):** `dist/` (1.3 MB), `server/dist/` (334 KB, contains a stale `dist/src/` duplicate), `server/generated-workspaces/` (2.8 MB). **Outside the repo:** `../.playwright-mcp/` (116 files), `../scratch_scope*.txt`, `../banner-overlap.png`. **Gitignore gaps:** `server/uploads/`, `*_errors*.txt`. Also `python-service/` is an **empty directory**. |
| 6 | Two folder conventions; mixed EOL | **CONFIRMED** | `src/components/features/{intake,spec}` + `src/components/{intake,admin}` (12 files) vs `src/features/{preview 19, projects 3, notifications 1}`. **8 of the 11 `src/features/*` domains are empty scaffolds**, and there are 43 empty dirs under `src/`. EOL (tracked files): 157 LF, **16 CRLF**, 9 mixed/none. No `.gitattributes`. |
| 7 | Docs sprawl; Docs/planning outside git | **CONFIRMED** | In repo: `README.md` 73, `PROJECT_OVERVIEW.md` 109, `TECHNICAL_DOCUMENTATION.md` 143. Outside: `../PROJECT-DOCUMENTATION.md` 378, `../handoff.md` 445, `../IMPLEMENTATION-LOG.md` 799, `../planning/` 14 files, `../CLAUDE.md`, `../Docs/`. The repo root is `FYP_implemenation/FYP_implemenation/`, so none of the outer files are versioned. |
| 8a | axios hardcodes prod URL | **CONFIRMED** | `src/lib/axios.ts:11-13`. `.env.example` declares `VITE_API_BASE_URL`, but **nothing reads it**. |
| 8b | SPA catch-all → INTERNAL_ERROR in dev | **CONFIRMED** | `server/src/app.ts:154-157` calls `res.sendFile(public/index.html)` with no callback. `server/public/` does not exist in dev, so the ENOENT goes to the global handler and returns 500 `INTERNAL_ERROR` (`:250`). Also the STEP comments are wrong: STEP 2 says CORS "MUST be first" but STEP 0/1 come before it, and STEP 4.5 says "BEFORE CORS/Helmet" but it runs after both. |
| 8c | docker-compose port 3001 + empty python-service | **CONFIRMED** | `docker-compose.yml:6` `3001:3001` (server listens on 5000). `:13-20` builds `./python-service`, which is empty, so `docker compose up` fails. |
| 9a | `server/.env` in history with real creds | **CONFIRMED** | `git show HEAD:server/.env` succeeds. It appears in **6 commits** (incl. `f30ac29 "chore: update Gemini API key"`). The deletion is staged but not committed. The remote is `github.com/Maryamfarooq2004/FlowForge`. |
| 9b | `.env.example` has real-looking values | **CONFIRMED, and they are live** | Checked by comparison (no values printed): `MONGODB_URI` (contains `user:pass@`), `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are **byte-identical to the live `server/.env`**. They are committed in HEAD too. |
| 9c | debug.controller deleteMany | **CONFIRMED** | `server/src/controllers/debug.controller.ts:9-10` `User.deleteMany({})`, `Project.deleteMany({})`. Not imported anywhere. |
| 9d | admin seed gated by JWT secret | **CONFIRMED** | `admin.controller.ts:17-18` compares `x-admin-key` to `process.env.JWT_ACCESS_SECRET`. `admin.routes.ts:10` mounts it **before** `requireAdmin`. Combined with 9b, anyone with repo read access can create an admin **and** forge tokens. |
| 9e | xlsx@0.18.5 parses uploads | **CONFIRMED** | `server/src/services/document.service.ts:2,46` `XLSX.read(buffer)` on user uploads. npm audit: prototype pollution + ReDoS, **no fix available on npm**. |
| 9f | npm audit critical/high | **CONFIRMED** | See §0. Critical `tar` is transitive (`@mapbox/node-pre-gyp`, i.e. bcrypt's build chain). `npm audit fix` resolves it. |
| 9g | *(new)* Personal password in log | **CONFIRMED (outside git)** | `../IMPLEMENTATION-LOG.md:168` contains a Google-account password in backticks. It is not versioned, but it was pasted into a doc. **Change that password.** |
| 10 | server devDeps react/pg/pg-hstore/sequelize/pg-mem unused? | **WRONG: they are needed** | `generator.compile.test.ts:46,93` type-checks emitted TSX (needs `react`, `react-dom`, `react-router-dom`, `@types/react*`). `generator.runtime.test.ts:50-51,155-157` `jest.mock('pg')` → `pg-mem`, `require('sequelize')`, and Sequelize's postgres dialect needs `pg` + `pg-hstore`. depcheck flags these as false positives. **Keep all of them.** |

### Additional findings (not on your list)

| ID | Finding | Evidence |
|---|---|---|
| A1 | **Truly unused deps.** Backend: `morgan`, `@types/morgan` (never imported). Frontend: `@tanstack/react-virtual` (no import), `autoprefixer`, `postcss` (no postcss config, since Tailwind v4 runs through `@tailwindcss/vite`). **Keep `tailwindcss`**: `src/index.css:1` imports it, which depcheck misses. | `npx depcheck` + grep |
| A2 | **Missing dependency**: `server/src/scripts/seed.ts:11` imports `mongodb` directly. It only resolves because Mongoose pulls it in transitively. | depcheck `missing` |
| A3 | **Inconsistent API envelope.** The global handler uses `{success, code, message}`. `utils/response.utils.ts` `sendError` uses `{success, error, timestamp}` (only the dead debug controller calls it). 71 hand-rolled `res.status().json({success…})` sites, only 11 with a `code`. Examples: `admin.controller.ts:19` `{success:false, message}` with no code. | grep over `controllers/`, `routes/` |
| A4 | **Layering violation.** `intake.routes.ts` (7), `project.routes.ts` (11), `ai.routes.ts` (1) define handlers inline, with no controller, contrary to the documented routes→controllers→services pattern. | `grep -c "async (req"` |
| A5 | **No React error boundary.** Any render error gives a white screen. | `grep errorElement src/app/router.tsx` returns nothing |
| A6 | **Jest open-handle leak** (a worker is force-exited on every run). It will make CI flaky. | jest output |
| A7 | **8 empty `src/features/*` scaffolds** (auth, deployment, documents, generation, intake, settings, spec, theme) and 43 empty dirs. Git doesn't track them, but they mislead readers. | `find src -type d -empty` |
| A8 | SVG logos are accepted (`upload.middleware.ts:19`) and served from `/uploads` on the app origin (`app.ts:82`). Helmet's CSP (STEP 3) should block inline script, but **verify** the response header on `/uploads/*.svg`. | code read |
| A9 | Largest hand-written files: `auth.service.ts` 469, `CloseEndedForm.tsx` 429, `preview.service.ts` 395, `BlueprintReviewPage.tsx` 346. None is alarming. **No split is planned.** It would be churn without a behaviour benefit. | `wc -l` |
| A10 | Backend `console.log` ×42 (outside generator templates), while a `logger.utils.ts` exists and is unused. | grep |

---

## 2. Ground rules for every step

1. Work on branch **`cleanup`**. One step = one commit = one PR-able unit. Never mix a behaviour change with a move or rename.
2. **Gate after every step** (the "standard gate"):
   ```bash
   npx tsc -b && npx eslint src ; (cd server && npx tsc --noEmit && npx jest)
   ```
   `eslint src` must not **increase** its error count. Jest must stay **≥164 passing**.
3. **Manual smoke test** (every step marked SMOKE): run `cd server && npm run dev` and `npm run dev`, then
   register → verify banner shows → create a Clinic project → fill intake → open `/project/:id/spec` → Approve → run generation (`/generating` → `/artifacts`) → open `/preview`.
4. **Rollback:** unless a step says otherwise, `git revert <sha>` (the branch is linear, so every step reverts on its own).
5. Nothing is pushed to `origin` until **Phase 1 (security) is finished**. The current tree still contains live secrets.
6. `NEEDS APPROVAL` = changes user-visible behaviour, deletes something that might be wanted, or rewrites git history. Don't start these without a written yes from both of you.

Owner key: **Ma** = Maryam (repo owner, so git and history ops go to her) · **Mu** = Mujtaba.

---

## 3. The steps

### Phase 0 — Safety net

**0.1 Off-repo backup** · Ma · risk **low** · 10 min
- Goal: a copy that survives any git mistake, including the untracked files git can't restore.
- Command: zip `D:\FYP\fypCode\FYP_implemenation\` (excluding `node_modules`) to a drive outside `D:\FYP`.
- Verify: open the zip and check `server/src/generation/` and `server/.env` are in it.
- Rollback: n/a.

**0.2 Extend .gitignore before the first commit** · Ma · risk **low** · 10 min
- Goal: don't commit user uploads or build logs.
- Files: `.gitignore` (add `server/uploads/`, `*_errors*.txt`, `.gen-*-tmp/`).
- Commands: `git check-ignore -v server/uploads/x` must print a match. `git status --porcelain | grep uploads` must be empty.
- Verify: standard gate. Rollback: revert.

**0.3 Branch + baseline commit + tag (local only)** · Ma · risk **low** · 20 min
- Goal: put the 4½ months of Module 1/2/5/6 work under version control.
- Commands:
  ```bash
  git switch -c cleanup
  git add -A && git status --short | wc -l   # expect ~150; eyeball the list for uploads/.env
  git diff --cached --name-only | grep -E '(^|/)\.env$|uploads/' && echo STOP
  git commit -m "chore: snapshot working tree before cleanup (Modules 1,2,5,6)"
  git tag cleanup-baseline
  ```
- Verify: standard gate + SMOKE. `git show --stat HEAD | tail -1`.
- Rollback: `git switch main` (the tag stays for reference). **Do not push.** HEAD still carries the live `.env.example` values, which Phase 1 removes.

### Phase 1 — Security (before any push)

**1.1 Rotate every exposed credential** · Ma (accounts) + Mu (redeploy env) · risk **med** · **NEEDS APPROVAL** · 1.5 h
- Goal: make the leaked values worthless. **Rotation is the real fix. History purge only tidies up.**
- Rotate: MongoDB Atlas DB user password (new user plus delete old, **or** reset), `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET` (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`), Gemini API key (it was in `f30ac29`), Gmail app password, and the personal Google password from `../IMPLEMENTATION-LOG.md:168`. Update `server/.env` locally and in the Railway env.
- User-visible effect: **every existing session is logged out** when the JWT secrets change.
- Verify: SMOKE on local, then `/health` on Railway. Old URI fails: `mongosh "<old uri>"` must be rejected.
- Rollback: not possible, and not needed. Keep the new values in a password manager.

**1.2 Sanitise `server/.env.example`** · Mu · risk **low** · 15 min
- Files: `server/.env.example`. Replace every value with a placeholder (`MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>`, `JWT_*=<64-hex, see command above>`, …).
- Verify: `grep -E "[0-9a-f]{40,}|://[^<]+:[^<]+@" server/.env.example` returns nothing. Standard gate.
- Rollback: revert.

**1.3 Delete `debug.controller.ts` and dead `response.utils.ts`** · Mu · risk **low** · 10 min
- Commands: `git rm server/src/controllers/debug.controller.ts server/src/utils/response.utils.ts`
- Verify: `grep -rn "debug.controller\|response.utils" server/src` returns nothing. Standard gate.

**1.4 Give the admin seed its own key and disable it in production by default** · Mu · risk **med** · **NEEDS APPROVAL** · 1 h (TDD)
- Files: `server/src/controllers/admin.controller.ts:17-18`, `server/.env.example`, new test `server/src/services/__tests__/admin.seed.test.ts` (or a controller test with supertest).
- Behaviour: require `ADMIN_SEED_KEY` (≥32 chars). If it is unset, return **404** (route invisible). Compare with `crypto.timingSafeEqual`. Never accept `JWT_ACCESS_SECRET`.
- Verify: new tests (no key → 404; JWT secret as key → 403; correct key → 200) plus the gate. Manual: `curl -XPOST localhost:5000/api/v1/admin/seed -H "x-admin-key: $JWT_ACCESS_SECRET"` → 403 or 404.
- Rollback: revert. Admin bootstrap docs (`admin@flowforge.app`) must mention the new key.

**1.5 Commit the `server/.env` removal** · Ma · risk **low** · 5 min
- It is already staged as `D` and is part of 0.3. Confirm `git ls-files server/.env` is empty, and `server/.gitignore:3` keeps it ignored.

**1.6 Purge secrets from history + force-push** · Ma · risk **high** · **NEEDS APPROVAL** (rewrites history) · 1.5 h
- Prereq: 1.1 done. **Mujtaba pushes nothing and re-clones afterwards.** Tell anyone with a fork.
- Commands (on a fresh mirror clone):
  ```bash
  pip install git-filter-repo
  git clone --mirror https://github.com/Maryamfarooq2004/FlowForge.git ff-mirror && cd ff-mirror
  git filter-repo --invert-paths --path server/.env --path .env
  git filter-repo --replace-text ../secrets.txt   # secrets.txt = one OLD value per line (URI, 2 JWT, Gemini key); kept outside repo, deleted afterwards
  git log --all -p | grep -cE "<old jwt prefix>|<atlas host>"   # expect 0
  git push --force --mirror
  ```
  Then fold the local `cleanup` branch onto the rewritten history (`git fetch && git rebase --onto origin/main cleanup-baseline~ cleanup`), or simpler: re-clone and cherry-pick the cleanup commits.
- Verify: on GitHub, `server/.env` is absent from every commit. Standard gate on the re-cloned tree.
- Rollback: the pre-purge mirror clone (keep it **offline**, then delete it after a week). ⚠ GitHub may keep cached views of old commits. Rotation (1.1) is what actually protects you. Ask GitHub Support to purge cached refs if the repo is public.

**1.7 Replace `xlsx@0.18.5`** · Mu · risk **med** · **NEEDS APPROVAL** (dependency swap) · 1.5 h
- Option A (recommended, smallest diff): the patched SheetJS build from the vendor CDN, `npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`. Same API, so `document.service.ts` is unchanged.
- Option B: `exceljs` (rewrites `parseSpreadsheet`, `document.service.ts:40-60`, and needs a separate CSV path).
- Verify: `npx jest src/services/__tests__/document.service.test.ts` + gate + `npm audit --omit=dev | grep -c xlsx` = 0. Manual: upload a `.xlsx` and a `.csv` on `/project/:id/documents` and check that fields are detected.
- Rollback: revert (lockfile included).

**1.8 `npm audit fix` (non-breaking only), both halves** · Mu (server) / Ma (frontend) · risk **low-med** · 45 min
- Commands: `npm audit fix` (never `--force`) in `.` and in `server/`. Fixes axios, form-data, react-router, tar, nodemailer, qs.
- `uuid` needs `--force` (major version). Leave it: it's moderate, and v3/v5/v6-with-buffer is not our usage. Document it as an accepted risk.
- Verify: gate + SMOKE (axios and react-router are core to auth refresh and navigation). `npm audit --omit=dev --audit-level=high` exits 0 in both folders.
- Rollback: revert (package-lock).

**1.9 Verify SVG-upload CSP (A8)** · Mu · risk **low** · 20 min
- Upload an SVG logo, then `curl -I localhost:5000/uploads/<file>.svg` must show `Content-Security-Policy` with no `unsafe-inline` script. If it doesn't, add `res.setHeader('Content-Security-Policy', "default-src 'none'")` on the `/uploads` static (**NEEDS APPROVAL**, since it could break logo rendering; test Theme Studio).

→ **After Phase 1: push `cleanup` to origin.**

### Phase 2 — Deletions (pure removals, no behaviour change)

**2.1 Delete repo junk** · Ma · risk **low** · 10 min
- `git rm server/tsc_errors.txt test-register.js debug_logo.png`, and commit the already-deleted `build_errors*.txt`.
- Check first: `grep -rn "debug_logo\|test-register" src server/src` must be empty (verified today).
- Local-only (not git): `rm -rf dist server/dist server/generated-workspaces/*`. These get regenerated.

**2.2 Delete dead frontend: pages** · Ma · risk **low** · **NEEDS APPROVAL** (LandingPage is 769 lines of marketing UI someone may want for the demo) · 20 min
- `git rm src/pages/LandingPage.tsx src/pages/infrastructure/InfrastructurePage.tsx src/pages/projects/ProjectSettingsPage.tsx`
- Verify: gate (tsc proves nothing imported them) + SMOKE. It stays recoverable from `cleanup-baseline`.

**2.3 Delete dead `GeneratedApp*` mockups (8 files, 1,165 lines)** · Mu · risk **low** · 15 min
- `git rm src/features/preview/components/GeneratedApp{DoctorDashboard,ManagerDashboard,NewPatientForm,Notifications,PatientDetail,PatientsList,PaymentsList,Shell}.tsx`. **Keep `GeneratedAppLogin.tsx`.**
- Verify: gate, then open `/preview` (login panel still renders).

**2.4 Delete dead UI atoms + shared (keep RouteError)** · Mu · risk **low** · 10 min
- `git rm src/components/ui/{Card,Badge,StatusBadge,Slider}.tsx src/components/shared/{Stepper,OnboardingEmpty}.tsx src/assets/logo-data.ts`
- Verify: gate.

**2.5 Delete dead backend stubs** · Mu · risk **low** · 15 min
- `git rm server/src/config/constants.ts server/src/routes/health.routes.ts server/src/types/api.types.ts server/src/generation/stages/index.ts`
- **Keep** `utils/logger.utils.ts` (used in 7.4) and all `scripts/*` (CLI entry points: `seed-questions.ts` is how the 67 intake questions get seeded). Optionally add `"seed:questions"` to `server/package.json` scripts so it is discoverable.
- Verify: gate.

**2.6 Remove empty scaffold dirs + empty `python-service/`** · Ma · risk **low** · 5 min
- `find src -type d -empty -delete && rmdir python-service` (git doesn't track these, so there is no commit, just a tidier tree). Do it **after** 5.2 so the move isn't confused by them.

**2.7 Outside-repo junk** · Ma · risk **low** · **NEEDS APPROVAL** · 5 min
- `../.playwright-mcp/` (116 Playwright screenshots/logs), `../scratch_scope*.txt`, `../banner-overlap.png`. Archive them into the 0.1 zip, then delete.

### Phase 3 — Remove or label fakes (behaviour changes, each on its own)

**3.1 WorkflowsOverviewPage: fix the 404 link** · Ma · risk **low** · 10 min
- `WorkflowsOverviewPage.tsx:267` `/blueprint` → `/spec`. Behaviour fix only; a one-liner.
- Verify: gate, then click "Review Blueprint" on `/project/:id/workflows` and it lands on the Spec Studio.

**3.2 WorkflowsOverviewPage: render the real spec** · Ma · risk **med** · **NEEDS APPROVAL** · 3 h
- Replace `WORKFLOW_STATES`/`STATE_DETAILS` (`:27,35`) with data from `useSpec(projectId)` (already exists in `src/hooks/useSpec.ts`): stages, transitions, and the roles per transition. Show an empty state if there is no spec yet.
- Verify: gate + SMOKE on a **School** project (it must no longer show clinic states) and on a Clinic project.
- Rollback: revert (the 3.1 fix survives).

**3.3 SupportPage: stop pretending to send** · Mu · risk **low** · **NEEDS APPROVAL** (pick one) · 1–3 h
- Option A (1 h, recommended for the FYP): replace the form with a `mailto:` link / "Email us at …" card, plus an honest note.
- Option B (3 h): a real `POST /api/v1/support` that uses the existing `email.service` (nodemailer) to mail the team, with rate limiting and a test.
- Plus: correct the false FAQ answers (`:18` images, `:30` custom domain, `:10` timing) to match what's built.
- Verify: gate. For B, a jest test plus a Playwright submit that checks `GET /api/v1/debug/last-email`.

**3.4 GeneratedAppLogin: stop "always failing"** · Mu · risk **low** · **NEEDS APPROVAL** · 45 min
- `GeneratedAppLogin.tsx:44-48`. Replace the fake timeout: pick the role from `roles` and call the existing preview role switch (switch to app mode as that role). Or, at minimum, show "Preview login is simulated — pick a role above" instead of an error.
- Verify: gate, then in `/preview` log in as each role.

**3.5 AdminApiUsagePage: fix the false Gemini statement** · Ma · risk **low** · 15 min
- `AdminApiUsagePage.tsx:30`: say that request/cost metrics aren't tracked, and drop "Gemini not configured".

**3.6 Infrastructure placeholder route** · Ma · risk **low** · **NEEDS APPROVAL** · 10 min
- `router.tsx:95`: delete the route (nothing links to it; check with `grep -rn "/infrastructure" src`), or keep it with the current honest label.

(UI Assistant `AppPreviewPage.tsx:180-200` is already labelled "coming soon", so no step.)

### Phase 4 — Error handling (small behaviour changes)

**4.1 Wire `RouteError` as `errorElement`** · Ma · risk **low** · **NEEDS APPROVAL** (new user-visible screen) · 45 min
- `src/app/router.tsx`: add `errorElement: <RouteError />` on the three layout routes (`:80`, `:140`, `:159`) and on the public routes.
- Verify: gate. Temporarily `throw` in a page, check the error screen renders, then remove the throw.

**4.2 Fix the dev SPA catch-all** · Mu · risk **low** · 30 min
- `server/src/app.ts:154-157`: resolve `index.html` once at boot. If it's missing, `next()` so the request falls through to the 404 JSON handler instead of a 500.
- Verify: `curl -i localhost:5000/` → 404 JSON in dev (was 500). Prod path: `npm run build` in both halves, copy the frontend dist into `server/public`, `npm start`, and `/hub` serves HTML.

### Phase 5 — Restructuring (moves only, zero behaviour change)

**5.1 Normalise line endings** · Ma · risk **low** · 20 min
- Add `.gitattributes`: `* text=auto eol=lf`, `*.png binary`, `*.snap text eol=lf`. Then `git add --renormalize . && git commit -m "chore: normalise line endings to LF"`.
- Verify: `git ls-files --eol | grep -c "w/crlf"` = 0. Gate (the snapshot test must still pass).
- Keep this commit whitespace-only, so `git blame --ignore-rev` works. Add its sha to `.git-blame-ignore-revs`.

**5.2 One feature-folder convention** · Mu · risk **med** · 2 h
- Target: `src/features/<domain>/components/*` (it already holds preview/projects/notifications). Move `src/components/features/intake/*` → `src/features/intake/components/`, `src/components/features/spec/*` → `src/features/spec/components/`, `src/components/intake/*` → `src/features/intake/components/`, `src/components/admin/*` → `src/features/admin/components/`. Use `git mv` only, then fix import paths.
- `src/components/` keeps only `ui/`, `layout/`, `shared/`.
- Verify: gate (tsc catches every broken import) + SMOKE, covering intake + spec + admin pages.
- Rollback: revert.

**5.3 Move inline route handlers into controllers (A4)** · Mu · risk **med** · 3 h
- `server/src/routes/{intake,project,ai}.routes.ts` → new `controllers/{intake,project,ai}.controller.ts`. Cut and paste the bodies, with no logic edits.
- Verify: gate + SMOKE (intake autosave, assemble, project CRUD, AI suggestions button).

**5.4 Docs consolidation** · Ma · risk **low** · **NEEDS APPROVAL** · 2 h
- In repo: keep `README.md` as the single entry point (setup, commands, env, architecture summary). Merge `PROJECT_OVERVIEW.md` + `TECHNICAL_DOCUMENTATION.md` into `docs/ARCHITECTURE.md`, then delete them.
- Decision needed: bring `../planning/`, `../IMPLEMENTATION-LOG.md`, `../handoff.md` **into** `docs/` so they're versioned (recommended; strip the password at log line 168 **before** adding). The alternative is leaving them outside git. `../Docs/*.docx` (SRS/SDD/Scope) are university deliverables. Recommend `docs/requirements/` but only if the files are small.
- Verify: links in README resolve.

### Phase 6 — Config fixes

**6.1 axios base URL from env** · Ma · risk **med** · 30 min
- `src/lib/axios.ts:11-13` → `import.meta.env.VITE_API_BASE_URL ?? (DEV ? 'http://127.0.0.1:5000' : '')`. An empty string means same origin, which fits the backend serving the SPA. Add `VITE_API_BASE_URL` to Vercel env and update `.env.example`.
- Verify: gate + SMOKE locally. `npm run build && npm run preview` with and without the var set (check the Network tab host).
- Rollback: revert. ⚠ If Vercel lacks the var after deploy, prod calls go same-origin, so **set the Vercel env before merging.**

**6.2 docker-compose fix** · Mu · risk **low** · **NEEDS APPROVAL** · 30 min
- Port `3001` → `5000`. Remove the `python-service` service (OCR is out of scope) or delete `docker-compose.yml` entirely. Optionally add `mongo:7` for local dev.
- Verify: `docker compose config` validates; `docker compose up server` → `/health` 200.

**6.3 Correct `app.ts` STEP comments** · Mu · risk **low** · 10 min
- Comments only: renumber and describe the real order (Sentry → trust proxy → CORS → helmet → body → static → cookies → sanitize → rate-limit → health → routes → SPA → 404 → errors).

**6.4 Fix `npm run lint` scope** · Ma · risk **low** · 10 min
- `eslint.config.js:9` `globalIgnores(['dist','server','docs'])` so the frontend lint stops walking backend code and generated workspaces.
- Verify: `npm run lint` and `npx eslint src` report the same count.

### Phase 7 — Lint and type quality (frontend lint → 0)

Each is a separate commit. After each one, `npx eslint src` must drop by the stated amount.

| Step | Owner | Risk | Time | Scope | Expected Δ errors |
|---|---|---|---|---|---|
| 7.1 router refresh rule | Ma | low | 45 min | Move `withSuspense` + lazy imports into `src/app/lazyPages.tsx` (or add `allowExportNames: ['router']`). `router.tsx` only exports the router. | −29/−30 |
| 7.2 unused vars + case-decl | Mu | low | 45 min | 22 `no-unused-vars`, `LoginPage:68` braces | −23 |
| 7.3 `AuthLayout` purity | Ma | low | 20 min | Compute particle positions once (`useState(() => …)`) | −8 |
| 7.4 set-state-in-effect | Ma (4) / Mu (4) | **med** (real bug class: extra renders, stale form resets) | 3 h | 8 sites (see §0). Prefer deriving state or `key` resets. `ThemeStudioPage`, `SettingsPage`, `CloseEndedForm` form hydration: use RHF `reset()` once on data load. SMOKE the touched pages. | −8 |
| 7.5 exhaustive-deps warnings | Mu | med | 1.5 h | 6 live sites (LandingPage's goes away in 2.2). Check each for stale closures, e.g. `GuidedIntakePage:98` autosave. | −6 warn |
| 7.6 FE `any` | Ma (18) / Mu (17) | low | 3 h | 35 `no-explicit-any` → real types, or `unknown` + narrowing | −35 |
| 7.7 BE `any` + logger | Mu | low-med | 4 h | Replace `catch (e: any)` → `unknown`, type the request/Mongoose lean docs, and route the 42 `console.log`s through `logger.utils.ts`. **Skip `server/src/generation/templates/**`**, whose `any` is inside emitted code strings. Target ≤ 40 non-test. | n/a (no BE lint) |
| 7.8 Backend ESLint config | Mu | low | 1 h | `server/eslint.config.js` (typescript-eslint recommended), `"lint"` script. Start with `no-explicit-any: warn`, error on everything else. | new gate |
| 7.9 Response envelope (A3) | Mu | **med** · **NEEDS APPROVAL** (clients parse `message`) | 2 h | One `sendSuccess`/`sendError` in `utils/response.utils.ts` (re-create it with the `{success, code, message, data}` shape the frontend's `ApiResponse` expects) + migrate the 60 codeless error sites. Frontend check: `grep -rn "response.data.message\|\.error\b" src`. | n/a |
| 7.10 Jest open-handle leak (A6) | Mu | low | 1 h | `npx jest --detectOpenHandles`, then close pg-mem/sequelize/mongoose handles in `afterAll`. | clean exit |

### Phase 8 — Dependencies

**8.1 Remove truly unused deps** · Ma (frontend) / Mu (backend) · risk **low** · 30 min
- Frontend: `npm rm @tanstack/react-virtual autoprefixer postcss`. Backend: `npm rm morgan @types/morgan`.
- **Do not remove** `pg`, `pg-hstore`, `pg-mem`, `sequelize`, `react`, `react-dom`, `react-router-dom`, `@types/react*`, `@types/pg` from `server/`, or `tailwindcss` from the frontend (see §1 #10 and A1).
- Verify: gate + `npm run build` in both halves. `npx depcheck` must list only the known false positives.

**8.2 Declare `mongodb` or stop importing it** · Mu · risk **low** · 10 min
- `server/src/scripts/seed.ts:11` → `import { Types } from 'mongoose'` and `new Types.ObjectId()`. Verify: `npm run seed` against a local DB.

### Phase 9 — CI gate

**9.1 GitHub Actions** · Ma · risk **low** · 1.5 h
- File: `.github/workflows/ci.yml`, triggered on push/PR to `main` and `cleanup`. Node 20 (match Railway). Two jobs:
  - **frontend:** `npm ci` → `npx tsc -b` → `npx eslint src --max-warnings=0` → `npm audit --omit=dev --audit-level=high`
  - **backend:** `npm ci` → `npx tsc --noEmit` → `npm run lint` (from 7.8) → `npx jest --ci` → `npm audit --omit=dev --audit-level=high`
- Jest env: tests need no DB (they mock Mongo and pg-mem, as verified by today's green run with no special env). Set `NODE_ENV=test`.
- Verify: open a PR from `cleanup`. Both jobs are green. Then break a type on a throwaway branch and CI goes red.
- Then: GitHub → Settings → Branches → protect `main` (require CI, require 1 review, since there are two devs).

**9.2 Merge `cleanup` → `main`** · Ma + Mu review · risk **med** · 30 min · SMOKE on the Railway/Vercel deploy afterwards.

---

## 4. Metrics — before / after

| Metric | Baseline (2026-09-26) | Target |
|---|---|---|
| Frontend `tsc -b` errors | 0 | 0 |
| Backend `tsc --noEmit` errors | 0 | 0 |
| Frontend ESLint (`eslint src`) | **103 errors / 9 warnings** | **0 / 0** |
| Backend ESLint | no config | config exists; **0 errors** (`any` as warning) |
| Jest | 164 tests / 13 suites, green, open-handle warning | **≥ 167** (+3 admin-seed tests), green, clean exit |
| Backend `any` (type positions, non-test) | 127 (168 incl. tests) | **≤ 40** |
| Frontend `no-explicit-any` | 35 | **0** |
| Dead frontend lines | 2,918 (19 files) | **0** (RouteError wired in, not deleted) |
| Dead backend files | 8 | 0 (scripts kept as CLI entry points) |
| Backend `console.log` (non-template) | 42 | 0 outside `logger.utils.ts` + boot banner |
| npm audit FE (prod) | 5 (2 high, 3 mod) | **0 high/critical** |
| npm audit BE (prod) | 10 (1 crit, 4 high, 5 mod) | **0 high/critical** (uuid moderate documented) |
| Unlabelled fakes | 4 (Support submit + FAQ, Workflows overview, GeneratedAppLogin, Admin "Gemini not configured") | **0** |
| Secrets in repo / history | live Mongo URI + 2 JWT secrets in HEAD; `.env` in 6 commits | **0**, all rotated |
| Uncommitted paths | 149 | 0 |
| CRLF files (tracked) | 16 | 0 |
| CI | none | required on `main` |

---

## 5. Workload and time

| Phase | Maryam | Mujtaba |
|---|---|---|
| 0 Safety net | 0.1, 0.2, 0.3 (0.7 h) | n/a |
| 1 Security | 1.1 (accounts), 1.5, 1.6, 1.8-FE (3.5 h) | 1.1 (env/redeploy), 1.2, 1.3, 1.4, 1.7, 1.8-BE, 1.9 (4.5 h) |
| 2 Deletions | 2.1, 2.2, 2.6, 2.7 (0.7 h) | 2.3, 2.4, 2.5 (0.7 h) |
| 3 Fakes | 3.1, 3.2, 3.5, 3.6 (3.6 h) | 3.3, 3.4 (2–4 h) |
| 4 Errors | 4.1 (0.8 h) | 4.2 (0.5 h) |
| 5 Restructure | 5.1, 5.4 (2.3 h) | 5.2, 5.3 (5 h) |
| 6 Config | 6.1, 6.4 (0.7 h) | 6.2, 6.3 (0.7 h) |
| 7 Quality | 7.1, 7.3, ½7.4, ½7.6 (4.1 h) | 7.2, ½7.4, 7.5, ½7.6, 7.7, 7.8, 7.9, 7.10 (13.3 h) |
| 8 Deps | 8.1-FE (0.2 h) | 8.1-BE, 8.2 (0.4 h) |
| 9 CI | 9.1, 9.2 (2 h) | 9.2 review (0.3 h) |
| **Total** | **≈ 18.6 h** | **≈ 28–30 h** |

**Grand total ≈ 47–49 hours** (about 6–7 working days for two people in parallel). Phase 7's backend items (7.7–7.9) make Mujtaba's column heavier. To balance, hand **7.8 + 7.10** (2 h) and the frontend half of **7.6** to Maryam, which brings both to about 23–24 h.

**Top 5 riskiest steps:** 1.6 history purge + force-push · 1.1 credential rotation (prod outage/logout if an env var is missed) · 6.1 axios base URL (a prod API outage if the Vercel env isn't set first) · 7.4 set-state-in-effect rewrites (form-hydration behaviour on intake/theme/settings) · 5.2 + 5.3 moves (large import churn; tsc protects the frontend, but inline→controller extraction relies on SMOKE).

---

## 6. Out of scope

Not part of this cleanup, and no step above touches them:
- New features: the Python OCR service (FE3.3), managed hosting / preview deployment / custom domains (FE9.2, FE7.4, FE9.3), the conversational UI assistant (FE7.5), logo colour extraction (FE4.2), GitHub push.
- **LangChain / DeepSeek** or any change to AI orchestration (the paused brainstorm in `../handoff.md`). This includes the Gemini timeout, `responseSchema` and repair loop. Those are feature hardening, not cleanup.
- **Any rewrite of `server/src/generation/`**. Only 2.5 (one dead barrel file) and 7.7's exclusion of its templates touch it. The emitted-app defects (no `package-lock.json` with `npm ci` Dockerfiles, no seed user) belong to generator work, not this plan.
- Hardening Modules 3, 4, 7, 8, 9 beyond the specific fakes listed in Phase 3.
- Splitting large files (A9), UI redesign, performance work.
- The `xlsx` → `exceljs` rewrite, unless Option B is chosen in 1.7.

## 7. Exit criteria

All of these must hold on `main`:
1. `npx tsc -b` and `cd server && npx tsc --noEmit`: **0 errors**.
2. `npx eslint src --max-warnings=0` and `cd server && npm run lint`: **0 errors**.
3. `cd server && npx jest`: all green, **≥ 164 tests** (target 167), no open-handle warning.
4. No unlabelled fakes: every placeholder either works or says so on screen (checked by walking every route in `router.tsx`).
5. No secrets: `git log --all -p | grep -E "<old secret prefixes>"` returns 0. `.env.example` holds only placeholders. All leaked credentials rotated.
6. `npm audit --omit=dev --audit-level=high` exits 0 in both folders.
7. CI runs all of the above on every PR, and `main` is branch-protected.
8. The SMOKE path works on the deployed app.

## 8. Decisions needed before starting (the NEEDS APPROVAL list)

1.1 rotate credentials (logs everyone out) · 1.4 new admin-seed key · 1.6 **history rewrite + force-push** · 1.7 xlsx replacement (A or B) · 1.9 upload CSP (only if needed) · 2.2 delete LandingPage & co. · 2.7 delete outside-repo junk · 3.2 real Workflows overview · 3.3 Support: mailto vs real endpoint · 3.4 preview login behaviour · 3.6 infrastructure route · 4.1 error screen · 5.4 bring planning/log/handoff into the repo · 6.2 docker-compose · 7.9 response-envelope change.
