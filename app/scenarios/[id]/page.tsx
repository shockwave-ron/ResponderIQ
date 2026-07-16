import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { getTempScenario } from '@/lib/temp-scenario-data';
import styles from './scenario.module.css';

interface ScenarioPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = await params;
  const scenario = getTempScenario(id);

  if (!scenario) {
    notFound();
  }

  return (
    <main>
      <PlaceholderBadge />
      <Card>
        <h1 className={styles.title}>{scenario.title}</h1>
        <p className={styles.scene}>{scenario.initialScene}</p>
        <h2 className={styles.prompt}>{scenario.decisionPrompt}</h2>
        <div className={styles.options}>
          {scenario.responseOptions.map((option) => (
            <Link
              key={option.id}
              href={`/results?scenario=${scenario.id}&choice=${option.id}`}
              className={styles.optionLink}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </Card>
    </main>
  );
}
