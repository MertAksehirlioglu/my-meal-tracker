# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MealSnap is a Nuxt 3 meal tracking app with AI-powered food image classification, nutrition tracking, and daily macro goals. Uses Supabase for auth/database/storage and Vuetify 3 for UI.

## Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run check            # Run typecheck + lint + format:check (use before committing)
npm run typecheck        # npx nuxi typecheck
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier format
npm run format:check     # Prettier check only
```

There are no tests in this project. The `check` script is the main quality gate.

## Environment Setup

Copy `.env.example` to `.env`. Required variables:

- `SUPABASE_URL`, `SUPABASE_KEY` — Supabase project credentials
- `SUPABASE_MEAL_IMAGES_BUCKET` — Storage bucket name (default: `meal-images`)
- `VITE_CONTACT_MAIL` — Contact page email
- `NUXT_PUBLIC_SIGNUP_DISABLED` — Set `true` for portfolio demo mode
- `NUXT_PUBLIC_DEMO_EMAIL`, `NUXT_PUBLIC_DEMO_PASSWORD` — Demo user credentials

TensorFlow.js runs entirely in-browser and requires no API keys.

## Architecture

### Request Flow

1. **Public pages** (`/`, `/login`, `/signup`, `/contact`) use `layouts/default.vue` (minimal `v-app` wrapper)
2. **Auth-protected pages** (`/home`, `/snap`, `/add-meal`, `/goals`, `/history`, `/profile`) use `layouts/authenticated.vue` (app bar, nav, demo notification) and are guarded by `middleware/auth.ts` (client-side, redirects to `/login` if no Supabase user)
3. **API calls** from pages use `composables/useAuthenticatedFetch.ts` which auto-attaches `Authorization: Bearer <JWT>` headers
4. **Server middleware** at `server/middleware/auth.ts` validates JWT tokens on all `/api/` routes (except `/api/health`, `/api/public/*`, `/api/auth/callback`), applies rate limiting (100 req/15min per IP+URL), and falls back to a mock user in development mode

### AI Classification Pipeline

The food analysis chain:

`snap.vue` → `useFoodAnalysis` → `useFoodClassification` → `lib/ai-providers.ts` (UnifiedAIManager) → `lib/tensorflow.ts`

- **`lib/ai-providers.ts`** — `UnifiedAIManager` singleton managing provider fallback chain. Currently only TensorFlow.js is registered. Access via `getAIManager()` or `createUnifiedInference()`
- **`lib/tensorflow.ts`** — Browser-side MobileNetV2 + COCO-SSD inference. Filters predictions by food-relevance keywords with weighted scores (1.0 direct food, 0.7 food-related objects, 0.3 context). Throws `NO_FOOD_DETECTED` when nothing found
- **`lib/nutrition-database.ts`** — Mock ~30-item nutrition lookup. Maps classification labels to macros with a 300cal default fallback
- **`lib/huggingface.ts`** and **`lib/openai.ts`** — Unused alternative providers (not wired into `UnifiedAIManager`)
- **`useOptimizedFoodAnalysis`** — Enhanced version with image caching (24h TTL, 100 entries), image resizing, exponential backoff retry, and performance metrics. Not currently used by any page

After classification, `components/AnalyzedMealReview.vue` lets the user adjust portions (0.75x/1.0x/1.5x multipliers) before saving.

### Demo Mode

Demo mode is a first-class feature for portfolio showcasing:

- **Client side**: `composables/useDemoData.ts` provides 7 days of hardcoded meals/progress/goals. `composables/useDemoNotification.ts` manages global restriction notifications via module-level refs
- **Server side**: `server/utils/demo.ts` blocks write operations for demo users
- Activated via `NUXT_PUBLIC_SIGNUP_DISABLED=true` runtime config
- Pages detect `isDemoUser` from `useAuth` and serve static demo data instead of calling APIs

### State Management

No dedicated store (no Pinia/Vuex). State lives in:

- **Module-level refs** in composables for shared client state (e.g., `useAuth` shares `loading`/`error` refs across all consumers; `useDemoNotification` has global `showDemoNotification` ref)
- **Supabase** as the persistent backend source of truth
- **localStorage** only for theme preference (`mealsnap-theme` key)

### Database

Supabase PostgreSQL with RLS. Tables: `users`, `meals`, `food_items`, `food_database`, `user_goals`, `user_progress`. TypeScript interfaces and table name constants in `server/database/schemas.ts`. Migration SQL in `server/database/migrations/`.

### Server API Routes

Currently only `server/api/health.get.ts` exists as an implemented route. Pages reference many endpoints (`/api/meals/*`, `/api/goals/*`, `/api/progress/*`, `/api/users/*`) that are **not present** in the repository — they may need to be created or may be served by direct Supabase client calls.

Server utilities in `server/utils/`:

- `auth.ts` — `requireAuth()`, `validateInput()`, common validators
- `demo.ts` — Demo user detection and write-blocking

## Vuetify Theme

Custom earthy palette in `plugins/vuetify.ts`: primary `#1A2E1C` (forest green), secondary `#E07A5F` (terra cotta), accent `#F0E6D3` (parchment), background `#F9F7F4` (warm off-white). MDI icon set. Fonts loaded in `nuxt.config.ts`: Fraunces (serif, headings) and DM Sans (sans-serif, body).

## Formatting & Linting

- **Prettier** (`.prettierrc`): No semicolons, single quotes, trailing commas (es5), 80 char width, LF line endings
- **ESLint** (`eslint.config.js`): `no-console` allowed, unused vars error (underscore-prefixed ignored), `no-explicit-any` warn, `vue/html-self-closing` off (deferred to Prettier)

## Code Quality Rules

- **File limits**: Max 500 lines per file, start breaking up at 400 lines
- **Function limits**: Max 30–40 lines per function, split classes over 200 lines
- **Single responsibility**: Every file, class, and function does one thing
- **Naming conventions**: ViewModel (UI logic), Manager (business logic), Coordinator (navigation/state flow). All names must be descriptive and intention-revealing — avoid `data`, `info`, `helper`, `temp`
- **Modularity**: Favor dependency injection, keep components interchangeable and testable. No god classes — split into UI, State, Handlers, Networking
