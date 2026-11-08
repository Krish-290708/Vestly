'use client';

import React from 'react';

/**
 * Last-resort error page. It replaces the root layout, so the app's stylesheet and design tokens
 * are not loaded here: styling is inline and uses plain colours that work on light and dark.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: '#F7F4EE',
          color: '#1A1814',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <main
          role="alert"
          style={{
            maxWidth: 440,
            width: '100%',
            padding: 24,
            background: '#FFFFFF',
            border: '1px solid #DDD7CB',
            borderRadius: 4,
          }}
        >
          <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>Vestly hit a problem</h1>
          <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.5, color: '#5B564C' }}>
            Your data has not been changed. Reload the page to try again.
          </p>
          {error?.digest && (
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#5B564C', fontFamily: 'monospace' }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#FFFFFF',
              background: '#1F5A44',
              border: 0,
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
