export function formatIndianPrice(amount: number): string {
  const abs = Math.abs(amount);

  if (abs >= 1e7) {
    return `₹ ${(amount / 1e7).toFixed(1)} Cr`;
  }
  if (abs >= 1e5) {
    return `₹ ${(amount / 1e5).toFixed(1)} Lac`;
  }
  return `₹ ${Math.round(amount).toLocaleString("en-IN")}`;
}
