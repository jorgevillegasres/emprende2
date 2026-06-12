export type PriceScenarioInput = {
  name: string;
  currentPrice: number;
  unitCost: number;
  targetMarginPercent: number;
};

export type PriceScenario = PriceScenarioInput & {
  currentMarginPercent: number;
  currentUnitProfit: number;
  suggestedPrice: number;
  suggestedUnitProfit: number;
  priceDelta: number;
  priceDeltaPercent: number;
};

export function calculatePriceScenario(input: PriceScenarioInput): PriceScenario {
  const currentUnitProfit = round(input.currentPrice - input.unitCost);
  const currentMarginPercent = input.currentPrice <= 0 ? 0 : round((currentUnitProfit / input.currentPrice) * 100);
  const targetRatio = input.targetMarginPercent / 100;
  const suggestedPrice = targetRatio >= 1 || targetRatio < 0 ? 0 : round(input.unitCost / (1 - targetRatio));
  const suggestedUnitProfit = round(suggestedPrice - input.unitCost);
  const priceDelta = round(suggestedPrice - input.currentPrice);
  const priceDeltaPercent = input.currentPrice <= 0 ? 0 : round((priceDelta / input.currentPrice) * 100);

  return {
    ...input,
    currentMarginPercent,
    currentUnitProfit,
    suggestedPrice,
    suggestedUnitProfit,
    priceDelta,
    priceDeltaPercent
  };
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
