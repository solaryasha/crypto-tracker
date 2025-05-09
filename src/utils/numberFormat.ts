export function formatNumber(num: number): string {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(2)}t`;
  }
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}b`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}m`;
  }
  
  return Number(num.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}