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

  if (!isValidName(user.name)) {
    console.log(" ❌ Invalid name (letters & spaces only, min 3 chars)\n");
    return true;
  }

  if (!isValidPhone(user.phone)) {
    console.log(" ❌ Invalid phone number\n");
    return true;
  }

  if (!isValidPassword(user.pass)) {
    console.log(" ❌ Password must be at least 4 characters\n");
    return true;
  }

  if (!isValidPin(user.pin)) {
    console.log(" ❌ Pin must be exactly 4 digits\n");
    return true;
  }

  if (!isValidBalance(user.balance)) {
    console.log(" ❌ Invalid balance amount\n");
    return true;
  }

  if (userExistsByPhone(user, accounts)) {
    console.log(" ❌ User already exists\n");
    return true;
  }

  return false;
};

export const isValidTransactionAmount = (amount) =>
  Number.isInteger(amount) && amount > 0;
