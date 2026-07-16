import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
}

interface ButtonAsLinkProps extends ButtonProps {
  readonly href: string;
  readonly onClick?: never;
}

interface ButtonAsButtonProps extends ButtonProps {
  readonly href?: never;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit';
}

/**
 * Shared button styling for both navigation (renders an anchor via
 * next/link) and in-page actions (renders a real <button>). Pass
 * `href` for navigation, or `onClick`/`type` for an action button —
 * not both.
 */
export function Button(props: ButtonAsLinkProps | ButtonAsButtonProps) {
  const { children, variant = 'primary' } = props;
  const className = `${styles.button} ${variant === 'secondary' ? styles.secondary : styles.primary}`;

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={className}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButtonProps;
  return (
    <button type={buttonProps.type ?? 'button'} onClick={buttonProps.onClick} className={className}>
      {children}
    </button>
  );
}
