import { promptSecret } from "@std/cli";

const doesExist = (user, accounts) =>
  accounts.some((each) => each.phone === user.phone);

const updateSheet = (to, from, info) => {
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

  return grauntAccess(user, accounts);
};

const readDetails = (user) => {
  console.log(` ${user.name}\n`);
  const phone = prompt(" Enter receiver's phone number :");
  const amount = parseInt(prompt("Enter amount :"));
  const pin = promptSecret("Enter transaction pin :");
  console.clear();

  return { phone, amount, pin };
};

const areValidDetails = (user, accounts, details) => {
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

  updateSheet(receiver, user, details);
  return true;
};

const sendMoney = (user, accounts) => {
  if (areValidDetails(user, accounts, readDetails(user))) {
    console.log(` ✅ Transaction Successfull ${user.name}\n`);
  }

  return grauntAccess(user, accounts);
};

const getStatements = (user, accounts) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter your pin :");
  console.clear();

  const msg = pin === user.pin
    ? ` ${user.name}'s Statements\n${user.history.join("\n")}\n`
    : ` ❌ Invalid pin ${user.name}`;
  console.log(msg);

  return grauntAccess(user, accounts);
};

const addBalance = (user, accounts) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter pin :");
  const amount = parseInt(prompt("Enter amount :"));
  console.clear();

  if (pin !== user.pin || Number.isNaN(amount) || amount < 0) {
    console.log(` ❌ Invalid pin or amount value ${user.name}`);
    return grauntAccess(user, accounts);
  }

  console.log(` ✅ Balance added successfully ${user.name}`);
  user.balance += amount;
  return grauntAccess(user, accounts);
};

const exitPage = (_user, accounts) => {
  console.clear();

  return main(accounts);
};

const ACTIONS = {
  1: checkBalance,
  2: sendMoney,
  3: getStatements,
  4: addBalance,
  5: exitPage,
};

const grauntAccess = (user, accounts) => {
  let msg = `\n 1. Checke balance\n 2. Send money\n `;
  msg += `3. Get statements\n 4. Add balance\n 5. Exit page\n\n`;
  const choice = prompt(msg);
  console.clear();

  if (!(choice in ACTIONS)) {
    console.log(` ❌ Invalid CHOICE ${user.name}`);
    return grauntAccess(user, accounts);
  }

  return ACTIONS[choice](user, accounts);
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
  } else if (!isValidPhone(user.phone)) {
    console.log(" ❌ Invalid phone number\n");
    return true;
  } else if (!isValidPassword(user.pass)) {
    console.log(" ❌ Password must be at least 4 characters\n");
    return true;
  } else if (!isValidPin(user.pin)) {
    console.log(" ❌ Pin must be exactly 4 digits\n");
    return true;
  } else if (!isValidBalance(user.balance)) {
    console.log(" ❌ Invalid balance amount\n");
    return true;
  } else if (doesExist(user, accounts)) {
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

const logIn = (accounts) => {
  const user = authenticateUser(readCredentials(), accounts);
  console.clear();

  if (!user) {
    console.log(" ❌ Credentials missmatch\n");
    return main(accounts);
  }

  console.log(`\tWelcome ${user.name}`);
  return grauntAccess(user, accounts);
};

const createAccount = (accounts) => {
  const user = readUserDetails();
  if (isInValidUser(user, accounts)) {
    return main(accounts);
  }

  console.log(" ✅ Account created successfylly\n");
  accounts.push(user);

  return main(accounts);
};

const exitHome = (accounts) =>
  Deno.writeTextFileSync(
    "./data.csv",
    accounts.map((each) => Object.values(each).join(",")).join("\n"),
  );

const appActions = {
  1: createAccount,
  2: logIn,
  3: exitHome,
};

const main = (accounts) => {
  const choice = prompt(" 1. Create Account\n 2. Log In\n 3. Exit\n\n");

  if (!(choice in appActions)) {
    console.clear();
    console.log(" ❌ Invalid CHOICE\n");
    return main(accounts);
  }

  return appActions[choice](accounts);
};

const loadAccountHolders = (account, accounts) => {
  const userInfo = account.split(",");
  accounts.push({
    name: userInfo[0],
    phone: userInfo[1],
    balance: parseInt(userInfo[2]),
    pass: userInfo[3],
    pin: userInfo[4],
    history: userInfo.slice(5),
  });
};

const fetchUsersData = (accounts) => {
  Deno.readTextFileSync("./src/data.csv")
    .split("\n")
    .forEach((account) => {
      loadAccountHolders(account, accounts);
    });

  return accounts;
};

// main(fetchUsersData([]));
