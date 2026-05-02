export type EstimateCalculationInput = {
  quantity: number;
  mhPerUnit: number;
  ratePerHour: number;
  difficultyFactor: number;
  contingencyPercent: number;
};

export type EstimateCalculation = {
  adjustedMHPerUnit: number;
  totalManHours: number;
  laborSubtotal: number;
  contingencyAmount: number;
  bidTotal: number;
};

export function calculateEstimate(input: EstimateCalculationInput): EstimateCalculation {
  const adjustedMHPerUnit = input.mhPerUnit * input.difficultyFactor;
  const totalManHours = adjustedMHPerUnit * input.quantity;
  const laborSubtotal = totalManHours * input.ratePerHour;
  const contingencyAmount = laborSubtotal * input.contingencyPercent;
  const bidTotal = laborSubtotal + contingencyAmount;

  return {
    adjustedMHPerUnit,
    totalManHours,
    laborSubtotal,
    contingencyAmount,
    bidTotal,
  };
}
