# Property Agent

Real estate dashboard web app built with:
- Next.js 15 (App Router)
- Chakra UI v3
- TypeScript
- React Icons (`lu`)
- Mock data (no backend required for current build)

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

### Auth
- `/login`
- `/register`

### Dashboard
- `/dashboard`
- `/properties`
- `/properties/[id]`
- `/properties/new`
- `/inquiries`
- `/inquiries/[id]`
- `/agents`
- `/agents/[id]`
- `/agents/new`
- `/landlords`
- `/landlords/[id]`
- `/landlords/new`
- `/reports`
- `/reports/revenue`

## Project Structure

```txt
app/
  layout.tsx
  providers.tsx
  page.tsx
  (auth)/
  (dashboard)/
components/
  layout/
  ui/
  properties/
  inquiries/
  agents/
  landlords/
  reports/
types/
lib/
hooks/
```

## Data

- Mock data is in `lib/mockData.ts`.
- Utility helpers are in `lib/utils.ts`.
- Typed models are in `types/*.ts`.
- Domain hooks are in `hooks/*.ts`.

## Chakra v3 Notes

To avoid the known `[chakra-ui > factory] No valid child found` runtime issue in this project:
- Prefer custom `ProgressRing` and `InitialsAvatar` components.
- Use native `.map()` iteration.
- Keep table rendering via safe wrappers already implemented in `components/ui/DataTable.tsx`.

## Validation

Type-check:

```bash
npx tsc --noEmit
```

## Current Caveat

If `next build` fails with `spawn EPERM` in your local environment, it is an OS/process permission issue in that environment, not a TypeScript compile error (TS checks currently pass).
