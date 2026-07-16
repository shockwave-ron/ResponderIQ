# Archived: Clinical IQ V1 Scenario API Route

- **Original file path:** `api/scenario/route.ts` (top-level, sibling to `app/`)
- **Original purpose:** Next.js route handler backing the scenario page above — GET/POST/DELETE endpoints for scenario state, action validation and application, and reset.
- **Date archived:** 2026-07-16
- **Reason archived:** Never reachable through the live application (outside `app/api/`, so App Router never registered it) and non-functional as committed — imports `actionInputSchema`, `applyAction`, `availableActions`, `initialState` from `@/lib/scenario` and `ScenarioState` from `@/lib/types`, neither of which exists anywhere in this repository. Preserved as historical record alongside the scenario page it served.

## Original Content

```ts
import { NextResponse } from "next/server";
import { actionInputSchema, applyAction, availableActions, initialState } from "@/lib/scenario";
import type { ScenarioState } from "@/lib/types";

let state: ScenarioState = initialState;

export async function GET() {
  return NextResponse.json({ state, availableActions: availableActions[state.phase] });
}

export async function POST(request: Request) {
  const body = actionInputSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  try {
    state = applyAction(state, body.data.actionId, body.data.rationale);
    return NextResponse.json({ state, availableActions: availableActions[state.phase] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 409 });
  }
}

export async function DELETE() {
  state = structuredClone(initialState);
  return NextResponse.json({ state, availableActions: availableActions[state.phase] });
}
```
