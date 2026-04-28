# G0DM0D3 Workspace

## Overview

A fullstack implementation of [G0DM0D3](https://github.com/elder-plinius/G0DM0D3) — a multi-model AI orchestration platform for prompt engineers, red teamers, and AI safety researchers. Races multiple LLMs in parallel via OpenRouter, scores their responses, and applies tools like Parseltongue (input obfuscation), AutoTune (adaptive sampling), and STM (output normalization).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind + shadcn/ui

## Architecture

```
artifacts/
  godmode/         # React frontend — multi-model AI cockpit UI
  api-server/      # Express backend — orchestrates OpenRouter calls
lib/
  api-spec/        # OpenAPI spec (source of truth for all API contracts)
  api-client-react/ # Generated React Query hooks
  api-zod/         # Generated Zod validation schemas
  db/              # Drizzle ORM schema + migrations
```

## G0DM0D3 Modules

### ULTRAPLINIAN (Multi-model Racing)
- Races 10-51 models in parallel depending on tier: `fast`, `standard`, `smart`, `power`, `ultra`
- Scores each response on a 100-point composite metric (length, anti-refusal, directness, latency)
- Winner is the highest-scoring response

### AutoTune
- Detects conversation context: `code`, `creative`, `analytical`, `conversational`, `chaotic`
- Selects optimized sampling parameters (temperature, top_p, top_k, penalties) per context
- Blends with balanced profile when confidence is low

### Parseltongue
- Input perturbation engine for red-teaming
- Detects trigger words and applies: `leetspeak`, `unicode_homoglyphs`, `zero_width`, `mixed_case`, `phonetic`, `random_mix`
- Intensity levels: `low`, `medium`, `high`

### STM (Semantic Transformation Modules)
- `hedge_reducer`: Removes "I think", "maybe", "perhaps", etc.
- `direct_mode`: Strips preambles and filler phrases
- `casual_mode`: Replaces formal vocabulary with plain language

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run build` — build API server

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/healthz` | GET | Health check |
| `/api/chat` | POST | Single-model chat with pipeline |
| `/api/race` | POST | ULTRAPLINIAN multi-model race |
| `/api/parseltongue` | POST | Apply input perturbation |
| `/api/autotune` | POST | Compute AutoTune parameters |
| `/api/feedback` | POST | Submit thumbs up/down |
| `/api/models` | GET | List OpenRouter models |
| `/api/stats` | GET | Race and usage statistics |
| `/api/history` | GET/DELETE | Conversation history |

## Privacy

- OpenRouter API key is stored in the browser's `localStorage` under `openrouter_api_key`
- Never stored server-side
- No authentication required

## Database Schema

- `history` — stores race and chat sessions with metadata
- `model_wins` — tracks per-model win counts and average scores for leaderboard

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
