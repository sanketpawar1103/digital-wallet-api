import { promptSecret } from "@std/cli";
import { isUserInvalid, isValidTransactionAmount } from "./validation.js";
import * as UI from "./digital_wallet_ui.js";

export const persistAccounts = (accounts) =>
  Deno.writeTextFileSync(
    "./database/accounts.json",
    JSON.stringify(accounts, null, 2),
  );

const applyTransaction = (to, from, info) => {
  const date = new Date().toLocaleString();
  const Amount = info.amount;
  to.history.push({
    Date: date,
    Description: `Received From: ${from.name}`,
    Amount,
  });

  from.history.push({
    Date: date,
    Description: `Paid To: ${to.name}`,
    Amount: -Amount,
  });

  to.balance += info.amount;
  from.balance -= info.amount;
};

const checkBalance = (user) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret(" Enter your pin number :");
  console.clear();

  const msg = pin === user.pin
    ? ` ✅ User : ${user.name}\n Account Balance = ${user.balance}\n`
    : ` ❌ Invalid Pin ${user.name}\n`;
  console.log(msg);
};

const readTransactionDetails = (user) => {
  console.log(`User: ${user.name}\n`);
  const phone = prompt("Enter receiver's phone number :");
  const amount = parseInt(prompt(" Enter amount :"));
  const pin = promptSecret(" Enter transaction pin :");
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
  const transactionDetails = readTransactionDetails(user);
  if (areTransactionDetailsValid(user, accounts, transactionDetails)) {
    console.log(` ✅ Transaction Successful\n`);
    persistAccounts(accounts);
  }
};

const viewTransactionHistory = (user) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter your pin :");
  console.clear();

  let [logger, data] = [console.log, `❌ Invalid pin`];

  if (pin === user.pin) {
    logger = console.table;
    data = user.history;
  }

  logger(data);
};

const recordTransaction = (user, Amount) => {
  const date = new Date().toLocaleString();
  user.history.push({
    Date: date,
    Description: `Deposited Amount`,
    Amount,
  });
};

const depositAmount = (user, amount, accounts) => {
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
    return;
  }

  recordTransaction(user, amount);
  console.log(` ✅ Balance added successfully\n`);
  depositAmount(user, amount, accounts);
};

const userMenuActions = {
  1: checkBalance,
  2: sendMoney,
  3: addBalance,
  4: viewTransactionHistory,
};

const grantAccess = (user, accounts) => {
  console.clear();
  while (true) {
    console.log(` User: ${user.name}`);
    let msg = `\n 1. Check Balance\n 2. Send Money\n `;
    msg += `3. Add Balance\n 4. View Transaction History\n 5. Logout\n\n`;

    const choice = prompt(msg);
    console.clear();

    if (choice === "5") return;

    if (!(choice in userMenuActions)) {
      console.log(` ❌ Invalid choice ${user.name}`);
      continue;
    }

    const action = userMenuActions[choice];
    action(user, accounts);
  }
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

export const logInUser = (accounts) => {
  const credentials = readCredentials();
  const user = findUserByPhone(credentials.phone, accounts);

  if (!user || user.pass !== credentials.pass) {
    console.clear();
    console.log(" ❌ Credentials mismatch\n");
    return;
  }

  grantAccess(user, accounts);
};

const ERROR_MSGS = {
  INVALID_NAME: "❌ Invalid name (letters & spaces only, min 3 chars)",
  INVALID_PHONE: "❌ Invalid phone number",
  INVALID_PASSWORD: "❌ Password must be at least 4 characters",
  INVALID_PIN: "❌ Pin must be exactly 4 digits",
  INVALID_BALANCE: "❌ Invalid balance amount",
  USER_ALREADY_EXISTS: "❌ User already exists",
};

export const createAccount = (accounts) => {
  const user = readUserDetails();
  const status = isUserInvalid(user, accounts);

  if (status !== "NO_ERROR") {
    console.log(ERROR_MSGS[status]);
    return;
  }

  console.log(" ✅ Account created successfully\n");
  accounts.push(user);
  persistAccounts(accounts);
};

const MAPPED_HANDLERS = {
  CREATE: createAccount,
  LOGIN: logInUser,
  EXIT: persistAccounts,
};

export const walletService = async (accounts) => {
  while (true) {
    const headLine = "👉 Select an option to continue";
    const homeActionChoice = await UI.selectFromOptions(headLine, UI.ACTIONS);

    MAPPED_HANDLERS[homeActionChoice](accounts);

    if (homeActionChoice === "EXIT") break;
  }
};
