# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MealSnap is a full-stack Nuxt 3 meal tracking application that allows users to analyze food via AI-powered image classification, track nutrition, and set daily macro goals. The app uses Supabase for backend services and Vuetify for UI components.

**Key Technologies:**

- Frontend: Nuxt 3 + Vue 3 + Vuetify 3
- Backend: Nuxt Server API routes
- Database & Auth: Supabase (PostgreSQL with RLS)
- AI: TensorFlow.js local inference
- Storage: Supabase Storage for meal images

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview

# Format code (when available)
npm run format

# Lint code (when available)
npm run lint
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations
- `VITE_CONTACT_MAIL` - Contact email address
- `SUPABASE_MEAL_IMAGES_BUCKET` - Bucket name for meal image storage

## Database Architecture

The app uses Supabase PostgreSQL with Row Level Security (RLS). Key tables:

- **users** - User profiles extending auth.users
- **meals** - Individual meal records with macro totals
- **food_items** - Individual food items within meals
- **food_database** - Reference nutrition data (public)
- **user_goals** - Daily macro targets
- **user_progress** - Daily aggregated nutrition data

Database schema is defined in `server/database/schemas.ts` with TypeScript interfaces. Initial migration is in `server/database/migrations/001_initial_schema.sql`.

## Key Composables & Architecture

**Authentication (`composables/useAuth.ts`)**

- Wraps Supabase auth with login, register, logout, and profile updates
- Uses `useSupabaseClient()` and `useSupabaseUser()` from @nuxtjs/supabase

**Food Analysis (`composables/useFoodAnalysis.ts`)**

- Main orchestrator for food image analysis
- Combines classification with nutrition estimation
- Uses mock nutrition database (replace with real data in production)

**Food Classification (`composables/useFoodClassification.ts`)**

- Generic interface for food classification providers
- Formats food names and normalizes prediction responses

**TensorFlow.js Integration (`lib/tensorflow.ts`)**

- Implements local food classification using MobileNet and COCO-SSD models
- Runs entirely in the browser without API calls
- Handles no-food-detection cases and provides proper error messages
- Factory function `createTensorFlowInference()` for easy instantiation

**Storage (`composables/useStorage.ts`)**

- Handles Supabase Storage operations for meal images
- Manages upload, download, and URL generation

## Server API Routes

Located in `server/api/`:

- `meals/index.post.ts` - Create new meal records
- `meals/today.get.ts` - Get today's meals for a user
- `goals/active.get.ts` - Get user's active macro goals
- `progress/today.get.ts` - Get today's nutrition progress

All API routes use Supabase service role key for database operations and handle RLS automatically.

## Component Structure

- **layouts/** - `default.vue` and `authenticated.vue` layouts
- **pages/** - File-based routing with auth-protected and public pages
- **components/** - Reusable Vue components (e.g., `FoodClassifier.vue`)
- **plugins/vuetify.ts** - Vuetify configuration

## Authentication & Security

- Uses Supabase Auth with email/password
- Row Level Security (RLS) enforced on all tables
- Auth redirects configured in `nuxt.config.ts`
- User profiles auto-created via database trigger
- All user data isolated via RLS policies

## AI Food Classification

The app uses TensorFlow.js for local food classification:

- **TensorFlow.js**: MobileNetV2 and COCO-SSD models
  - Runs locally in browser (no API calls)
  - No API keys required
  - Privacy-focused processing
- **No-food handling**: Proper error messages when no food detected
- Currently uses mock nutrition data - integrate with real nutrition database for production

## Testing & Quality

When running tests or quality checks:

- Check package.json scripts for available test commands
- Use ESLint and Prettier for code formatting (scripts may need to be added)
- Verify environment variables are properly configured
- Test Supabase connection and RLS policies
- Test TensorFlow.js model loading

## Common Development Patterns

- Use TypeScript interfaces from `server/database/schemas.ts`
- Follow Vue 3 Composition API patterns
- Leverage Nuxt auto-imports for composables
- Use Vuetify components for consistent UI
- Handle loading/error states in all async operations
- Implement proper error boundaries and user feedback
- Follow RLS patterns for data access security
