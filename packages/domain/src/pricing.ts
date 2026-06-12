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
  recommendation: PriceRecommendation;
};

export type PriceRecommendation = {
  action: "raise-price" | "reduce-cost" | "maintain";
  tone: "growth" | "focus" | "steady";
  title: string;
  detail: string;
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
    priceDeltaPercent,
    recommendation: getPriceRecommendation(priceDelta, priceDeltaPercent)
  };
}

function getPriceRecommendation(priceDelta: number, priceDeltaPercent: number): PriceRecommendation {
  if (priceDelta <= 0) {
    return {
      action: "maintain",
      tone: "steady",
      title: "Mantener precio",
      detail: "El precio actual ya supera el margen objetivo."
    };
  }

  if (priceDeltaPercent > 25) {
    return {
      action: "reduce-cost",
      tone: "focus",
      title: "Revisar costo",
      detail: "La subida sugerida supera 25%; conviene revisar insumos, receta o empaque."
    };
  }

  return {
    action: "raise-price",
    tone: "growth",
    title: "Subir precio",
    detail: `Necesita subir ${formatCurrency(priceDelta)} para llegar al margen objetivo.`
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace(/\s/u, " ");
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
