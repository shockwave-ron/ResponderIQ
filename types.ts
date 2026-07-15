# Clinical IQ V1 — Controlled Prototype Build Specification

## Frozen V1 Scope
Clinical IQ V1 trains operational judgment from dispatch through handoff. The graded core is scene management, situational awareness, provider safety, communication, logistics, professionalism, teamwork, resource use, reassessment, transport strategy, and handoff quality. Deeper physiology and medication modeling remain later-layer work.

## Parallel Build Tracks
1. Learner UI: hybrid interaction using visible state, structured actions, and optional free-text rationale.
2. Scenario & State Engine: deterministic phases, branching, time, environment, resources, and consequences.
3. Data/API Layer: versioned scenario objects, run state, event logging, scoring evidence, and audit trail.
4. Vertical Slice: BLS-01 from dispatch to debrief.

## Runtime Boundaries
- Scenario & State
- Human Interaction
- Safety & Operations
- Action & Reassessment
- Learning & Evaluation
- Platform & Trust
- AI Gateway (constrained language only; no control over clinical truth)

## Canonical Flow
Dispatch -> parallel safety/resource planning + situational awareness -> windshield -> PPE/entry -> contact -> operational actions -> reassessment -> transport -> handoff -> debrief.

## UI Rules
- No disappearing options.
- No answer highlighting.
- No diagnosis-dependent button availability.
- Free text may record reasoning, but deterministic actions drive state.
- Visible state shows facts the learner could realistically know.
- Mobile-first and keyboard accessible.

## Scoring
Always scored: scene safety, communication, patient safety, resource management, reassessment, professionalism.
Situational dimensions activate only when the scenario actually contains evidence for them.
Every score must be traceable to one or more events.

## Acceptance Criteria
- One complete run reaches debrief.
- Same input sequence produces the same deterministic state and score.
- Invalid actions are rejected.
- Unavailable information is not penalized.
- Good reasoning with a bad outcome can still receive fair credit.
- Every score can be explained from the event log.
- AI text cannot alter scenario truth.
