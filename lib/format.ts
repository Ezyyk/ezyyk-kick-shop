export function formatPoints(n: number): string {
  // We use en-US to get comma as thousands separator as requested ("carky")
  // and we don't want any decimal places for points.
  return new Intl.NumberFormat('en-US').format(n);
}
