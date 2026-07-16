# Archived: Clinical IQ V1 Root Layout

- **Original file path:** `layout.tsx` (repository root — not `app/layout.tsx`)
- **Original purpose:** Alternate root layout for the Clinical IQ V1 prototype; imported `./styles.css`.
- **Date archived:** 2026-07-16
- **Reason archived:** Never executed by Next.js — App Router only reads `layout.tsx` from inside the `app/` directory, so a copy at the project root is inert regardless of content. Fully superseded by the live `app/layout.tsx`. No unique behavior preserved by keeping this active.

## Original Content

```tsx
import type { ReactNode } from "react";
import "./styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```
