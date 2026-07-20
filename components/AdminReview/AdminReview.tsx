'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
import { bls01 } from '@/lib/scenarios/bls-01';
import { computeHiddenSummary } from '@/lib/engine/scoring';
import { buildDebrief } from '@/lib/engine/debrief';
import { LOCAL_ADMIN_REVIEW_STORAGE_KEY } from '@/components/SimulatorPlayer/SimulatorPlayer';
import type { SceneState } from '@/lib/engine/types';
import styles from './AdminReview.module.css';

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getServerSnapshot(): SceneState | null {
  return null; // no localStorage during server rendering
}

export function AdminReview() {
  // window.localStorage only exists in the browser, and its contents can in
  // principle change outside of React (another tab, manual clearing). That
  // makes this an external-store read, which is exactly what
  // useSyncExternalStore is for — it's the correct way to do this without
  // ever calling setState inside an effect. The cache below keeps the
  // returned snapshot referentially stable when the underlying value hasn't
  // actually changed, which useSyncExternalStore requires to avoid looping.
  const cacheRef = useRef<{ raw: string | null; parsed: SceneState | null }>({
    raw: undefined as unknown as string | null,
    parsed: null,
  });
  const getSnapshot = useCallback((): SceneState | null => {
    const raw = window.localStorage.getItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY);
    if (raw === cacheRef.current.raw) return cacheRef.current.parsed;
    let parsed: SceneState | null = null;
    try {
      parsed = raw ? (JSON.parse(raw) as SceneState) : null;
    } catch {
      parsed = null;
    }
    cacheRef.current = { raw, parsed };
    return parsed;
  }, []);

  const state = useSyncExternalStore(subscribeToStorage, getSnapshot, getServerSnapshot);

  return (
    <main className={styles.wrap}>
      <div className={styles.disclaimer}>
        <h1>Local Administrator Review</h1>
        <p>
          This shows only the most recently completed BLS-01 playthrough saved in this browser.
          It is not authenticated, not secure, and not linked to any account. It is not multi-user
          or multi-device, and nothing here is permanently stored — clearing this browser&apos;s
          storage removes it. Database-backed instructor review, across devices and learners, is a
          future requirement, not part of this build.
        </p>
      </div>

      {state === null && <p>No completed BLS-01 playthrough found in this browser yet.</p>}
      {state !== null && <ReviewContent state={state} />}
    </main>
  );
}

function ReviewContent({ state }: { readonly state: SceneState }) {
  const summary = computeHiddenSummary(state, bls01);
  const debrief = buildDebrief(state);

  return (
    <>
      <section className={styles.section}>
        <h2>Completion</h2>
        <p>Status: {state.completion?.status ?? 'not completed'} at minute {state.completion?.atMinute ?? '\u2014'}</p>
      </section>

      <section className={styles.section}>
        <h2>Critical safety flags ({state.criticalFlags.length})</h2>
        {state.criticalFlags.length === 0 && <p>None.</p>}
        {state.criticalFlags.map((flag) => (
          <div key={flag.id} className={styles.flag}>
            <p><strong>At minute {flag.atMinute}:</strong> {flag.whatHappened}</p>
            <p>{flag.whyDangerous}</p>
            <p>Consequence: {flag.consequence}</p>
            <p>Safer alternative: {flag.saferAlternative}</p>
            <p>Acknowledged by learner: {flag.acknowledged ? 'yes' : 'no'}</p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Hidden category scoring</h2>
        <table className={styles.table}>
          <thead>
            <tr><th>Category</th><th>Positive</th><th>Notable</th><th>Minor</th><th>Critical</th></tr>
          </thead>
          <tbody>
            {Object.entries(summary.categoryTally).map(([category, tally]) => (
              <tr key={category}>
                <td>{category.replace(/_/g, ' ')}</td>
                <td>{tally.positive}</td>
                <td>{tally.notable}</td>
                <td>{tally.minor}</td>
                <td>{tally.critical}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Behavioral tags</h2>
        <p>Demonstrated: {summary.behavioralTagsDemonstrated.join(', ') || 'none'}</p>
        <p>Missed (relevant to this scenario): {summary.behavioralTagsMissed.join(', ') || 'none'}</p>
      </section>

      <section className={styles.section}>
        <h2>Operational differential history</h2>
        {state.differential.history.length === 0 && <p>Never updated.</p>}
        {state.differential.history.map((entry, i) => (
          <p key={i}>At minute {entry.atMinute}: {entry.reads.join(', ')} {entry.reason && `\u2014 ${entry.reason}`}</p>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Resources</h2>
        {Object.values(state.resources).map((r) => (
          <p key={r.kind}>
            {r.kind.replace(/_/g, ' ')}: {r.status.replace(/_/g, ' ')}
            {r.requestedAtMinute !== undefined && ` \u2014 requested at minute ${r.requestedAtMinute}, ETA ${r.etaMinutes} min, arrival minute ${r.arrivesAtMinute}`}
          </p>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Full timeline</h2>
        <p className={styles.hint}>Every entry includes the actions actually available at that moment, not just the one chosen.</p>
        <ol className={styles.timeline}>
          {state.timeline.map((entry, i) => (
            <li key={i} className={styles.timelineEntry}>
              <span className={styles.timeStamp}>t+{entry.atMinute}m</span>
              <span className={styles.entryKind}>[{entry.kind}]</span>
              <span>{entry.label}</span>
              {entry.detail && <div className={styles.detail}>{entry.detail}</div>}
              {entry.chosenActionId && entry.availableActionIds && entry.availableActionIds.length > 1 && (
                <div className={styles.detail}>
                  Also available: {entry.availableActionIds.filter((id) => id !== entry.chosenActionId).join(', ')}
                </div>
              )}
              {entry.observations && entry.observations.length > 0 && (
                <div className={styles.observations}>
                  {entry.observations.map((o, oi) => (
                    <div key={oi}>[{o.category} / {o.severity}{o.tag ? ` / ${o.tag}` : ''}] {o.note}</div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2>Evidence behind the learner debrief</h2>
        <p><strong>Headline shown to learner:</strong> {debrief.headline}</p>
        <p><strong>Strengths shown</strong> ({debrief.strengths.length}) are drawn from the positive-severity observations above that carry learner-facing text.</p>
        <p><strong>Missed opportunities shown</strong> ({debrief.missedOpportunities.length}) are drawn from the notable/minor-severity observations above that carry learner-facing text.</p>
      </section>
    </>
  );
}
