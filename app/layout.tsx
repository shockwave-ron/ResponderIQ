import type { Metadata } from 'next';
import { ReducedMotionSync } from '@/components/ReducedMotionSync/ReducedMotionSync';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResponderIQ',
  description: 'Adaptive EMS training — a real operational BLS-01 simulator.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReducedMotionSync />
        {children}
      </body>
    </html>
  );
}
