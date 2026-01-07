import { promptSecret } from "@std/cli";
import {
  isUserInvalid,
  isValidTransactionAmount,
  userExistsByPhone,
} from "./validation.js";

const persistAccounts = (accounts) =>
  Deno.writeTextFileSync(
    "./src/accounts.json",
    JSON.stringify(accounts, null, 2),
  );

const setUpSignalHandlers = (accounts) => {
  const interruption = (signal) => {
    console.clear();
    console.log(`\n⚠️  Received ${signal}. Saving data...`);
    persistAccounts(accounts);
    console.log("✅ Accounts saved. Exiting safely.");
  };

  Deno.addSignalListener("SIGINT", () => interruption("SIGINT"));
  Deno.addSignalListener("SIGTERM", () => interruption("SIGTERM"));
};

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
  } else if (!isValidTransactionAmount(details.amount)) {
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
  const transactiondetails = readTransactionDetails(user);
  if (areTransactionDetailsValid(user, accounts, transactiondetails)) {
    console.log(` ✅ Transaction Successful ${user.name}\n`);
    persistAccounts(accounts);
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

const recordTransaction = (user, amount) =>
  user.history.push(
    `${new Date().toLocaleString()}\t${
      "Amount Added".padEnd(30)
    } Amount : ${amount}`,
  );

const depositeAmount = (user, amount, accounts) => {
  user.balance += amount;
  persistAccounts(accounts);
};

const addBalance = (user, accounts) => {
  console.log(` ${user.name}\n`);
  const amount = parseInt(prompt("Enter amount :"));
  const pin = promptSecret("Enter pin :");
  console.clear();

  if (pin !== user.pin || !isValidTransactionAmount(amount)) {
    console.log(` ❌ Invalid pin or amount value ${user.name}`);
    return grantAccess(user, accounts);
  }

  recordTransaction(user, amount);
  console.log(` ✅ Balance added successfully ${user.name}`);
  depositeAmount(user, amount, accounts);

  return grantAccess(user, accounts);
};

const logoutAccount = (_user, accounts) => {
  console.clear();

  return main(accounts);
};

const userMenuActions = {
  1: checkBalance,
  2: sendMoney,
  3: addBalance,
  4: viewTransactionHistory,
  5: logoutAccount,
};

const grantAccess = (user, accounts) => {
  let msg = `\n 1. Check Balance\n 2. Send Money\n `;
  msg += `3. Add Balance\n 4. View Transaction History\n 5. Logout\n\n`;
  const choice = prompt(msg);
  console.clear();

  if (!(choice in userMenuActions)) {
    console.log(` ❌ Invalid choice ${user.name}`);
    return grantAccess(user, accounts);
  }

  return userMenuActions[choice](user, accounts);
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

const findUserByPhone = (credentialsPhone, accounts) =>
  accounts.find((each) => each.phone === credentialsPhone);

const loginUser = (accounts) => {
  const credentials = readCredentials();
  const user = findUserByPhone(credentials.phone, accounts);
  console.clear();

  if (!user || user.pass !== credentials.pass) {
    console.log(" ❌ Credentials mismatch\n");
    return main(accounts);
  }

  console.log(`\tWelcome ${user.name}`);

  return grantAccess(user, accounts);
};

const createAccount = (accounts) => {
  const user = readUserDetails();
  if (isUserInvalid(user, accounts, userExistsByPhone)) {
    return main(accounts);
  }

  console.log(" ✅ Account created successfully\n");
  accounts.push(user);
  persistAccounts(accounts);

  return main(accounts);
};

const homeMenuActions = {
  1: createAccount,
  2: loginUser,
  3: persistAccounts,
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
    const content = Deno.readTextFileSync("./src/accounts.json");

    return JSON.parse(content);
  } catch {
    return [];
  }
};

const accounts = fetchAllAccounts();
setUpSignalHandlers(accounts);
main(accounts);
