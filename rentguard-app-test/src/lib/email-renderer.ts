import React from 'react';

/**
 * Renders a React email component to an HTML string.
 * Uses a dynamic import for react-dom/server to avoid Next.js App Router
 * compile-time restrictions on direct imports of react-dom/server.
 */
export async function renderEmail(element: React.ReactElement): Promise<string> {
    const { renderToStaticMarkup } = await import('react-dom/server');
    return '<!DOCTYPE html>' + renderToStaticMarkup(element);
}
