// Motor de salud del negocio. Extraido de la UI a un modulo puro y testeable.
// Regla central de honestidad: un negocio que pierde plata (neto < 0) NUNCA
// puede mostrarse como saludable ni con un puntaje alto, aunque su margen sea
// bueno. El veredicto financiero no depende del estado de configuracion.

export type HealthVerdict = "healthy" | "watch" | "at-risk" | "setup";

export type BusinessHealth = {
  score: number;
  verdict: HealthVerdict;
  label: string;
  reason: string;
};

// Umbrales documentados (heuristicas, ajustables con evidencia de uso real).
const LOW_MARGIN_PERCENT = 40;
const MARGIN_SCORE_CAP = 70;
const LOSS_SCORE_CAP = 45;

export type BusinessHealthInput = {
  averageMarginPercent: number;
  netAfterExpenses: number;
  lowStockCount: number;
  hasMinimumData: boolean;
  // Modo caja: cuando el negocio carga datos gruesos (entro/salio) no se puede
  // calcular margen, asi que el veredicto se basa solo en el resultado de caja.
  cashMode?: { cashResult: number };
};

export function calculateBusinessHealth(input: BusinessHealthInput): BusinessHealth {
  const { averageMarginPercent, netAfterExpenses, lowStockCount, hasMinimumData, cashMode } = input;

  if (!hasMinimumData) {
    return {
      score: 0,
      verdict: "setup",
      label: "Sin datos suficientes",
      reason: "Registra ventas y gastos para evaluar la salud de tu negocio."
    };
  }

  if (cashMode) {
    if (cashMode.cashResult < 0) {
      return { score: 30, verdict: "at-risk", label: "En riesgo", reason: "Sale mas plata de la que entra este mes." };
    }
    if (cashMode.cashResult === 0) {
      return { score: 50, verdict: "watch", label: "Justo en cero", reason: "Entra lo mismo que sale; cuida tu margen." };
    }
    return { score: 70, verdict: "healthy", label: "Caja en positivo", reason: "Entra mas plata de la que sale este mes." };
  }

  const marginComponent = clamp(averageMarginPercent, 0, MARGIN_SCORE_CAP);
  const cashComponent = netAfterExpenses > 0 ? 25 : netAfterExpenses === 0 ? 10 : 0;
  const inventoryPenalty = Math.min(Math.max(lowStockCount, 0) * 3, 15);
  let score = clamp(Math.round(marginComponent + cashComponent - inventoryPenalty), 5, 100);

  if (netAfterExpenses < 0) {
    score = Math.min(score, LOSS_SCORE_CAP);
    return {
      score,
      verdict: "at-risk",
      label: "En riesgo",
      reason: "Estas gastando mas de lo que ganas este mes."
    };
  }

  if (averageMarginPercent < LOW_MARGIN_PERCENT) {
    return {
      score,
      verdict: "watch",
      label: "Requiere atencion",
      reason: "Tu margen promedio esta bajo; revisa precios o costos."
    };
  }

  return {
    score,
    verdict: "healthy",
    label: "Saludable",
    reason: "Margen y caja en buen estado este mes."
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
