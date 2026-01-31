import { promptSecret } from "@std/cli";
import { isValidTransactionAmount } from "./validation.js";
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

export const createAccount = async (accounts) => {
  const user = await UI.readCreateAccountInput();
  console.clear();

  if (findUserByPhone(user.phone, accounts)) {
    UI.displayResult(
      `⚠️ User already exists with this phone number\n`,
    );
    return;
  }

  UI.displayResult(" ✅ Account Created Successfully\n");
  accounts.push(user);
  persistAccounts(accounts);
};

const MAPPED_HANDLERS = {
  CREATE: createAccount,
  LOGIN: logInUser,
  EXIT: persistAccounts,
};

export const walletService = async (accounts) => {
  console.clear();

  while (true) {
    const headLine = "👉 Select an option to continue\n";
    const homeActionChoice = await UI.selectFromOptions(headLine, UI.ACTIONS);

    await MAPPED_HANDLERS[homeActionChoice](accounts);

    if (homeActionChoice === "EXIT") break;
  }
};
