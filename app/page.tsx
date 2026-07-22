import { Button } from '@/components/Button';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <main>
      <div className={styles.wordmark}>ResponderIQ</div>
      <p className={styles.tagline}>Adaptive EMS training, built on real decisions.</p>
      <Button href="/dashboard">Begin training</Button>
    </main>
  );
}
