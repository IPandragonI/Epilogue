export function applyUsageDiscount(rawTokens: number): number {
  const rate = Number(process.env.TOKEN_USAGE_DISCOUNT_RATE ?? 1);
  const safeRate = Number.isFinite(rate) && rate > 0 && rate <= 1 ? rate : 1;
  return Math.max(Math.round(rawTokens * safeRate), 0);
}
