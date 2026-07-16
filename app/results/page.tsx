import Link from 'next/link';
import { Card } from '@/components/Card';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { Button } from '@/components/Button';
import { getTempScenario } from '@/lib/temp-scenario-data';
import styles from './results.module.css';

interface ResultsPageProps {
  readonly searchParams: Promise<{ scenario?: string; choice?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { scenario: scenarioId, choice } = await searchParams;
  const scenario = scenarioId ? getTempScenario(scenarioId) : undefined;
  const selectedOption = scenario?.responseOptions.find((option) => option.id === choice);

  return (
    <main>
      <PlaceholderBadge />
      <Card>
        <h1 className={styles.heading}>Scenario complete</h1>
        {scenario && selectedOption && (
          <p className={styles.choiceLine}>
            You selected: <span className={styles.choiceValue}>&ldquo;{selectedOption.label}&rdquo;</span>
          </p>
        )}
        <p className={styles.message}>
          {scenario?.completionMessage ??
            'Scenario complete. In the full application, this screen will show adaptive feedback, an updated learner profile, and a link to the After-Action Review.'}
        </p>
        <Link href="/scenarios" className={styles.link}>
          <Button variant="secondary">Back to scenarios</Button>
        </Link>
      </Card>
    </main>
  );
}
