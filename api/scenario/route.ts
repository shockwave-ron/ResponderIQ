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
