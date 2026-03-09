export function formatPrice(amount: number, currency = 'IRR'): string {
  if (currency === 'IRT') {
    return new Intl.NumberFormat('fa-IR').format(Math.floor(amount / 10)) + ' تومان';
  }

  if (currency === 'IRR') {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
