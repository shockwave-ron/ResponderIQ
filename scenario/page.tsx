"use client";

import { useEffect, useState } from "react";
import type { ScenarioAction, ScenarioState } from "@/lib/types";

type Payload = { state: ScenarioState; availableActions: ScenarioAction[] };

export default function ScenarioPage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/scenario", { cache: "no-store" });
    setPayload(await response.json());
  }

  useEffect(() => { load(); }, []);

  async function act(actionId: string) {
    setError("");
    const response = await fetch("/api/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, rationale })
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "Action failed");
    setPayload(data);
    setRationale("");
  }

  async function reset() {
    await fetch("/api/scenario", { method: "DELETE" });
    await load();
  }

  if (!payload) return <main className="shell">Loading…</main>;
  const { state, availableActions } = payload;

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">BLS-01 Prototype · {state.phase}</p>
        <div className="grid">
          <div className="card">
            <h2>Scene</h2>
            {state.observations.map((item) => <p key={item}>{item}</p>)}
            {state.phase !== "debrief" && (
              <>
                <textarea
                  placeholder="State your reasoning. The simulator reacts to your choice; it does not give the answer."
                  value={rationale}
                  onChange={(event) => setRationale(event.target.value)}
                />
                <div className="actions">
                  {availableActions.map((action) => (
                    <button key={action.id} onClick={() => act(action.id)}>{action.label}</button>
                  ))}
                </div>
              </>
            )}
            {state.phase === "debrief" && (
              <div>
                <h2>Debrief</h2>
                <p><strong>Strongest action:</strong> {state.actions.find((a) => a.id === "reassess-scene")?.label ?? "Review your best safety or communication decision."}</p>
                <p><strong>Priority improvement:</strong> Focus on the lowest-scoring dimension shown beside this panel.</p>
                <p><strong>Reflection:</strong> What changed your plan, and what would you recognize sooner next time?</p>
              </div>
            )}
            {error && <p>{error}</p>}
          </div>

          <aside className="card">
            <h2>Visible State</h2>
            <p>Safety: {state.safetyState}</p>
            <p>Trust: {state.trust}</p>
            <p>Elapsed: {state.elapsedSeconds}s</p>
            <h3>Resources</h3>
            {state.resources.map((item) => <p className="muted" key={item}>{item}</p>)}
            <h3>Score</h3>
            {Object.entries(state.score).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
            <button className="secondary" onClick={reset}>Reset scenario</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
