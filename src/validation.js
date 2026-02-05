export const isValidTransactionAmount = (amount) =>
  Number.isInteger(amount) && amount > 0;

export const isPinMatch = (actualPin, expectedPin) => actualPin === expectedPin;

export const isValidTransaction = (user, accounts, details) => {
  const receiver = accounts.find((each) => each.phone === details.receiver);

  if (!receiver || receiver.phone === user.phone) return "INVALID_PHONE";

  if (user.balance < details.amount) return "INSUFFICIENT_BALANCE";

  if (!isPinMatch(user.pin, details.pin)) return "PIN_MISMATCH";

  return "ALL_RIGHT";
};
