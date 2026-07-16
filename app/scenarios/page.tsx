import Link from 'next/link';
import { Card } from '@/components/Card';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { getAllTempScenarios } from '@/lib/temp-scenario-data';
import styles from './scenarios.module.css';

export default function ScenarioSelectionPage() {
  const scenarios = getAllTempScenarios();

  return (
    <main>
      <PlaceholderBadge />
      <h1 className={styles.heading}>Select a scenario</h1>
      <div className={styles.list}>
        {scenarios.map((scenario) => (
          <Link key={scenario.id} href={`/scenarios/${scenario.id}`} className={styles.link}>
            <Card>
              <h2 className={styles.title}>{scenario.title}</h2>
              <p className={styles.description}>{scenario.briefDescription}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
