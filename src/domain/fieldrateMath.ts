export const calculateManHours = (crewSize: number, hours: number) => {
  return crewSize * hours;
};

export const calculateMHPerUnit = (manHours: number, quantity: number) => {
  if (quantity === 0) return 0;
  return manHours / quantity;
};

export const applyDifficulty = (mhPerUnit: number, difficultyFactor: number) => {
  return mhPerUnit * difficultyFactor;
};

export const calculateLaborCost = (
  adjustedMH: number,
  quantity: number,
  ratePerHour: number
) => {
  const totalMH = adjustedMH * quantity;
  return totalMH * ratePerHour;
};

export const applyContingency = (cost: number, percent: number) => {
  return cost * (1 + percent);
};