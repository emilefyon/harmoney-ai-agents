export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0.0s';
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds - minutes * 60);
  return `${minutes}m ${seconds}s`;
}

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '$0.00';
  if (amount < 0.01) return '<$0.01';
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}
