export function calculateWeightedAverageCost(
  oldStock: number,
  oldAverageCost: number,
  addedQuantity: number,
  addedTotalCost: number
) {
  const newStock = oldStock + addedQuantity;
  if (newStock === 0) return 0;
  return Math.round(((oldStock * oldAverageCost + addedTotalCost) / newStock + Number.EPSILON) * 100) / 100;
}
