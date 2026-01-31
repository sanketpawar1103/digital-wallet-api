export const isValidTransactionAmount = (amount) =>
  Number.isInteger(amount) && amount > 0;
