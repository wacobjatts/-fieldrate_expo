export type EstimateInput = {
  quantity: number;
  unit: string;

  crewSize: number;
  ratePerHour: number;

  mhPerUnit: number;

  difficultyFactor: number;
  contingencyPercent: number;
};