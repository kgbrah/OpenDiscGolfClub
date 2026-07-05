export const baseStyles = `
<style>
  :host {
    --odgc-surface: #f8faf7;
    --odgc-panel: #ffffff;
    --odgc-elevated: #ffffff;
    --odgc-text: #192319;
    --odgc-muted: #5d6b5f;
    --odgc-subtle: #879184;
    --odgc-border: #dde5d8;
    --odgc-primary: #ff6b35;
    --odgc-secondary: #2d5016;
    --odgc-info: #004e89;
    --odgc-success: #2f7d32;
    --odgc-warning: #d99b00;
    --odgc-error: #b3261e;
    --odgc-radius: 16px;
    --odgc-radius-sm: 10px;
    --odgc-space-1: 4px;
    --odgc-space-2: 8px;
    --odgc-space-3: 12px;
    --odgc-space-4: 16px;
    --odgc-space-5: 20px;
    --odgc-space-6: 24px;
    --odgc-space-8: 32px;
    --odgc-space-10: 40px;
    --odgc-space-12: 48px;
    --odgc-shadow-subtle: 0 1px 2px rgba(25, 35, 25, 0.05);
    --odgc-shadow-default: 0 10px 28px rgba(25, 35, 25, 0.12);
    color: var(--odgc-text);
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  .odgc-shell {
    background: var(--odgc-surface);
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius);
    padding: var(--odgc-space-8);
  }

  .odgc-stack {
    display: grid;
    gap: var(--odgc-space-10);
  }

  .odgc-section {
    display: grid;
    gap: var(--odgc-space-5);
  }

  .odgc-section-header {
    display: grid;
    gap: var(--odgc-space-2);
  }

  .odgc-title {
    color: var(--odgc-text);
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0;
  }

  .odgc-suite-title {
    font-size: 40px;
  }

  .odgc-subtitle,
  .odgc-description,
  .odgc-muted {
    color: var(--odgc-muted);
    font-size: 16px;
    line-height: 1.55;
    margin: 0;
  }

  .odgc-grid {
    display: grid;
    gap: var(--odgc-space-4);
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .odgc-card {
    background: var(--odgc-panel);
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius);
    box-shadow: var(--odgc-shadow-subtle);
    color: var(--odgc-text);
    display: grid;
    gap: var(--odgc-space-3);
    padding: var(--odgc-space-5);
    transition: box-shadow 200ms ease-in-out, transform 200ms ease-in-out;
  }

  .odgc-card:hover {
    box-shadow: var(--odgc-shadow-default);
    transform: translateY(-2px);
  }

  .odgc-card-title {
    color: var(--odgc-text);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.35;
    margin: 0;
  }

  .odgc-meta {
    color: var(--odgc-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    gap: var(--odgc-space-2);
  }

  .odgc-badge {
    align-items: center;
    background: color-mix(in srgb, var(--odgc-secondary) 12%, transparent);
    border-radius: 999px;
    color: var(--odgc-secondary);
    display: inline-flex;
    font-size: 12px;
    font-weight: 700;
    gap: var(--odgc-space-1);
    line-height: 1.35;
    padding: var(--odgc-space-1) var(--odgc-space-3);
    text-transform: uppercase;
  }

  .odgc-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--odgc-space-2);
    margin-top: var(--odgc-space-2);
  }

  .odgc-button,
  button.odgc-button {
    align-items: center;
    background: var(--odgc-primary);
    border: 1px solid transparent;
    border-radius: var(--odgc-radius-sm);
    color: var(--odgc-panel);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    justify-content: center;
    min-height: 40px;
    padding: var(--odgc-space-2) var(--odgc-space-4);
    text-decoration: none;
    transition: background 120ms ease-out, transform 120ms ease-out;
  }

  .odgc-button:hover {
    filter: brightness(0.96);
    transform: translateY(-1px);
  }

  .odgc-button:active {
    transform: translateY(0);
  }

  .odgc-button:focus-visible,
  .odgc-input:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--odgc-primary) 35%, transparent);
    outline-offset: 2px;
  }

  .odgc-button.is-secondary {
    background: var(--odgc-panel);
    border-color: var(--odgc-border);
    color: var(--odgc-text);
  }

  .odgc-input {
    background: var(--odgc-panel);
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius-sm);
    color: var(--odgc-text);
    font: inherit;
    min-height: 44px;
    padding: var(--odgc-space-3) var(--odgc-space-4);
    width: 100%;
  }

  .odgc-controls {
    display: grid;
    gap: var(--odgc-space-3);
    grid-template-columns: minmax(0, 1fr);
  }

  .odgc-table-wrap {
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius);
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    min-width: 640px;
    width: 100%;
  }

  th,
  td {
    border-bottom: 1px solid var(--odgc-border);
    padding: var(--odgc-space-3);
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--odgc-muted);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .odgc-error {
    border-color: var(--odgc-error);
    color: var(--odgc-error);
  }

  .odgc-hidden {
    display: none;
  }

  @media (max-width: 640px) {
    .odgc-shell {
      padding: var(--odgc-space-5);
    }

    .odgc-suite-title {
      font-size: 32px;
    }

    table {
      min-width: 100%;
      table-layout: fixed;
    }

    th,
    td {
      font-size: 10px;
      padding: var(--odgc-space-2) var(--odgc-space-1);
      word-break: break-word;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none;
    }
  }
</style>
`
