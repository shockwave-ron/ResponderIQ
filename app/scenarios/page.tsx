import Link from 'next/link';
import { Card } from '@/components/Card';
import { bls01 } from '@/lib/scenarios/bls-01';
import styles from './scenarios.module.css';

export default function ScenarioSelectionPage() {
  return (
    <main>
      <h1 className={styles.heading}>Select a scenario</h1>
      <div className={styles.list}>
        <Link href={`/scenarios/${bls01.id}`} className={styles.link}>
          <Card>
            <h2 className={styles.title}>{bls01.title}</h2>
            <p className={styles.description}>{bls01.dispatchSummary}</p>
          </Card>
        </Link>
      </div>
    </main>
  );
}
