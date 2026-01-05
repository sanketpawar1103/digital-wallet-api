import { promptSecret } from "@std/cli";

const userExistsByPhone = (user, accounts) =>
  accounts.some((each) => each.phone === user.phone);

const applyTransaction = (to, from, info) => {
  to.history.push(
    `${
      new Date().toLocaleString()
    }\tFrom : ${from.name}\tAmount : ${info.amount}`,
  );

  from.history.push(
    `${new Date().toLocaleString()}\tTo : ${to.name}\tAmount : ${info.amount}`,
  );

  to.balance += info.amount;
  from.balance -= info.amount;
};

const checkBalance = (user, accounts) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret(" Enter your pin number :");
  console.clear();

  const msg = pin === user.pin
    ? ` ✅ User : ${user.name}\n Account Balance = ${user.balance}\n`
    : ` ❌ Invalid Pin ${user.name}\n`;
  console.log(msg);

  return grantAccess(user, accounts);
};

const readTransactionDetails = (user) => {
  console.log(` ${user.name}\n`);
  const phone = prompt(" Enter receiver's phone number :");
  const amount = parseInt(prompt("Enter amount :"));
  const pin = promptSecret("Enter transaction pin :");
  console.clear();

  return { phone, amount, pin };
};

const areTransactionDetailsValid = (user, accounts, details) => {
  const receiver = accounts.find((each) => each.phone === details.phone);

  if (!receiver || receiver.phone === user.phone) {
    console.log(" ❌ Receiver not present\n");
    return false;
  } else if (details.amount < 0 || Number.isNaN(details.amount)) {
    console.log(` ❌ Invalid amount value\n`);
    return false;
  } else if (user.balance < details.amount) {
    console.log(` ❌ Insufficient balance\n Balance = ${user.balance}\n`);
    return false;
  } else if (user.pin !== details.pin) {
    console.log(` ❌ Incorrect Pin\n Entered pin = ${details.pin}\n`);
    return false;
  }

  applyTransaction(receiver, user, details);
  return true;
};

const sendMoney = (user, accounts) => {
  if (
    areTransactionDetailsValid(user, accounts, readTransactionDetails(user))
  ) {
    console.log(` ✅ Transaction Successful ${user.name}\n`);
  }

  return grantAccess(user, accounts);
};

const viewTransactionHistory = (user, accounts) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter your pin :");
  console.clear();

  const msg = pin === user.pin
    ? ` ${user.name}'s Statements\n${user.history.join("\n")}\n`
    : ` ❌ Invalid pin ${user.name}`;
  console.log(msg);

  return grantAccess(user, accounts);
};

const addBalance = (user, accounts) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter pin :");
  const amount = parseInt(prompt("Enter amount :"));
  console.clear();

  if (pin !== user.pin || Number.isNaN(amount) || amount < 0) {
    console.log(` ❌ Invalid pin or amount value ${user.name}`);
    return grantAccess(user, accounts);
  }

  console.log(` ✅ Balance added successfully ${user.name}`);
  user.balance += amount;
  return grantAccess(user, accounts);
};

const logoutAccount = (_user, accounts) => {
  console.clear();

  return main(accounts);
};

const userMenuActions = {
  1: checkBalance,
  2: sendMoney,
  3: viewTransactionHistory,
  4: addBalance,
  5: logoutAccount,
};

const grantAccess = (user, accounts) => {
  let msg = `\n 1. Check balance\n 2. Send money\n `;
  msg += `3. Get statements\n 4. Add balance\n 5. Exit page\n\n`;
  const choice = prompt(msg);
  console.clear();

  if (!(choice in userMenuActions)) {
    console.log(` ❌ Invalid choice ${user.name}`);
    return grantAccess(user, accounts);
  }

  return userMenuActions[choice](user, accounts);
};

const REGEX = {
  NAME: /^[A-Za-z ]{3,50}$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: /^.{4,}$/,
  PIN: /^\d{4}$/,
};

export const isValidName = (name) => REGEX.NAME.test(name.trim());

export const isValidPhone = (phone) => REGEX.PHONE.test(phone);

export const isValidPassword = (pass) => REGEX.PASSWORD.test(pass);

export const isValidPin = (pin) => REGEX.PIN.test(pin);

export const isValidBalance = (balance) =>
  Number.isInteger(balance) && balance >= 0;

export const isInValidUser = (user, accounts) => {
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

const readUserDetails = () => {
  console.clear();
  console.log("\t| CREATE ACCOUNT |\n");
  const name = prompt("Enter full name:");
  const phone = prompt("Enter phone number:");
  const balance = parseInt(prompt("Enter balance:"));
  const pass = promptSecret("Enter password for account:");
  const pin = promptSecret("Enter pin:");

  return { name, phone, balance, pass, pin, history: [] };
};

const readCredentials = () => {
  console.clear();
  console.log("\t| LOG IN PAGE |\n");
  const phone = prompt("Enter mobile number:");
  const pass = promptSecret("Enter password :");

  return { phone, pass };
};

const authenticateUser = (credentials, accounts) =>
  accounts.find((each) =>
    each.phone === credentials.phone && each.pass === credentials.pass
  );

const loginUser = (accounts) => {
  const user = authenticateUser(readCredentials(), accounts);
  console.clear();

  if (!user) {
    console.log(" ❌ Credentials mismatch\n");
    return main(accounts);
  }

  console.log(`\tWelcome ${user.name}`);
  return grantAccess(user, accounts);
};

const createAccount = (accounts) => {
  const user = readUserDetails();
  if (isInValidUser(user, accounts)) {
    return main(accounts);
  }

  console.log(" ✅ Account created successfully\n");
  accounts.push(user);

  return main(accounts);
};

const saveAndExit = (accounts) =>
  Deno.writeTextFileSync(
    "./accounts.json",
    JSON.stringify(accounts, null, 2),
  );

const homeMenuActions = {
  1: createAccount,
  2: loginUser,
  3: saveAndExit,
};

const main = (accounts) => {
  const choice = prompt(
    " 1. Create Account\n 2. Log In\n 3. Close application\n\n",
  );

  if (!(choice in homeMenuActions)) {
    console.clear();
    console.log(" ❌ Invalid choice\n");
    return main(accounts);
  }

  return homeMenuActions[choice](accounts);
};

const fetchAllAccounts = () => {
  try {
    const content = Deno.readTextFileSync("./accounts.json");
    return JSON.parse(content);
  } catch {
    return [];
  }
};

main(fetchAllAccounts());
