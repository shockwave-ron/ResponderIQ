import styles from './PlaceholderBadge.module.css';

/**
 * Visible marker for temporary Milestone 1 content. Shown on every
 * screen that renders data from `lib/temp-scenario-data.ts`, so it's
 * unmistakable in the running app — not just in source comments —
 * that this content is a placeholder and not an approved scenario.
 */
export function PlaceholderBadge() {
  return <span className={styles.badge}>Temporary placeholder content</span>;
}
