import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  readonly children: ReactNode;
}

/** A simple bordered content panel used to group scenario content on a page. */
export function Card({ children }: CardProps) {
  return <div className={styles.card}>{children}</div>;
}
