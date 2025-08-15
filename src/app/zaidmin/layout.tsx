
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
        <body className="font-body antialiased bg-muted/40">
            {children}
        </body>
    </html>
  );
}
