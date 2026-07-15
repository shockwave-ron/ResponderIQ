import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Clinical IQ V1</p>
        <h1>Operational judgment from dispatch to handoff.</h1>
        <p>
          A deterministic EMS decision-training prototype focused on scene management,
          safety, communication, logistics, professionalism, and reassessment.
        </p>
        <Link className="primary" href="/scenario">Start BLS-01 Prototype</Link>
      </section>
    </main>
  );
}
