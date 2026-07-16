import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResponderIQ',
  description: 'Adaptive EMS training — Milestone 1 application flow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
