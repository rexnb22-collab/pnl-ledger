import { useState } from 'react';

/** Tracks which async action (by id) is running. */
export function useBusy() {
  const [busy, setBusy] = useState(null);
  const run = async (id, fn) => {
    setBusy(id);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };
  return [busy, run];
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

export const actionBtn = 'btn-secondary h-8 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50';
