# ResponderIQ

**Adaptive EMS training, built on real decisions.**

ResponderIQ is a browser-based simulator for emergency medical services (EMS)
training. Instead of multiple-choice quizzes, it drops a trainee into a scenario
that unfolds in simulated time: decisions cost minutes, events fire while you
deliberate, and the situation adapts to the choices you make. Afterward, the
engine scores the run across behavioral categories — scene safety, resource
management, communication, prioritization, and more — and produces a plain-language
debrief, plus a detailed review view for administrators.

The first scenario, **BLS-01 — "Second Floor, No Elevator,"** is a residential
fall where the real challenge isn't the diagnosis: it's getting the patient three
flights down safely with the crew and equipment you brought or thought to call
for. It's deliberately designed so more than one plan can succeed.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React
- TypeScript
- [Vitest](https://vitest.dev) for unit tests

The simulation logic lives in [`lib/engine`](lib/engine) (clock, reducer, scoring,
resources, differential, debrief) and is intentionally scoped to what BLS-01
needs — a minimal reusable engine rather than a general-purpose EMS model.
Scenarios live in [`lib/scenarios`](lib/scenarios); UI lives in
[`app`](app) and [`components`](components).

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

## Project layout

```
app/            Next.js routes (home, scenarios, admin review)
components/     Reusable UI (Button, Card, SimulatorPlayer, AdminReview)
lib/engine/     Simulation engine — clock, reducer, scoring, debrief
lib/scenarios/  Scenario definitions (BLS-01)
docs/           Design notes and archived specs
```
