const REGEX = {
  NAME: /^[A-Za-z ]{3,50}$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: /^.{4,}$/,
  PIN: /^\d{4}$/,
};

export const userExistsByPhone = (user, accounts) =>
  accounts.some((each) => each.phone === user.phone);

export const isValidName = (name) => REGEX.NAME.test(name.trim());

export const isValidPhone = (phone) => REGEX.PHONE.test(phone);

export const isValidPassword = (pass) => REGEX.PASSWORD.test(pass);

export const isValidPin = (pin) => REGEX.PIN.test(pin);

export const isValidBalance = (balance) =>
  Number.isInteger(balance) && balance >= 0;

export const isUserInvalid = (user, accounts) => {
  console.clear();

  if (!isValidName(user.name)) return "INVALID_NAME";

  if (!isValidPhone(user.phone)) return "INVALID_PHONE";

  if (!isValidPassword(user.pass)) return "INVALID_PASSWORD";

  if (!isValidPin(user.pin)) return "INVALID_PIN";

  if (!isValidBalance(user.balance)) return "INVALID_BALANCE";

  if (userExistsByPhone(user, accounts)) return "USER_ALREADY_EXISTS";

  return "NO_ERROR";
};

export const isValidTransactionAmount = (amount) =>
  Number.isInteger(amount) && amount > 0;
