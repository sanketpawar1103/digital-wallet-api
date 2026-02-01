import { areTransactionDetailsValid, isPinMatch } from "./validation.js";
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

const PIN_FLAGS = {
  true: (successMsg, logger = console.log) =>
    UI.displayResult(successMsg, logger),
  false: () => UI.displayResult(`❗️ Error pin : Pin mismatch\n`),
};

const checkBalance = async (user) => {
  console.clear();
  UI.displayResult(` ${user.name}\n`);
  const pin = await UI.readUpiPin();
  const balanceSuccessMsg = ` 🤑 Available Balance : ${user.balance}\n`;

  PIN_FLAGS[isPinMatch(pin, user.pin)](balanceSuccessMsg);
};

const TRANSACTION_STATES = {
  ALL_RIGHT: "✅ Transaction Successful 🎉\n",
  INVALID_PHONE: "❗️ Error phone : Receiver not found\n",
  INSUFFICIENT_BALANCE: "❗️ Error balance : Insufficient balance\n",
  PIN_MISMATCH: "❗️ Error pin : Pin mismatch\n",
};

const sendMoney = async (user, accounts) => {
  const transactionDetails = await UI.readTransactCredentials(user);
  const transactionStatus = areTransactionDetailsValid(
    user,
    accounts,
    transactionDetails,
  );

  UI.displayResult(TRANSACTION_STATES[transactionStatus]);

  if (transactionStatus === "ALL_RIGHT") {
    applyTransaction(receiver, user, details);
    persistAccounts(accounts);
  }
};

const viewTransactionHistory = async (user) => {
  console.clear();
  console.log(` ${user.name}\n`);
  const pin = await UI.readUpiPin();
  console.clear();

  PIN_FLAGS[isPinMatch(pin, user.pin)](user.history, console.table);
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

const addBalance = async (user, accounts) => {
  UI.displayResult(` ${user.name}\n`);
  const { amount, pin } = await UI.readAddBalanceDetails();

  if (!isPinMatch(pin, user.pin)) {
    PIN_FLAGS["false"]();
    return;
  }

  recordTransaction(user, amount);
  PIN_FLAGS["true"](` ✅ Balance added successfully\n`);

  depositAmount(user, amount, accounts);
};

const MAPPED_FEATURES = {
  BALANCE: checkBalance,
  SEND_MONEY: sendMoney,
  DEPOSIT: addBalance,
  HISTORY: viewTransactionHistory,
};

const grantAccess = async (user, accounts) => {
  console.clear();
  while (true) {
    UI.displayResult(` User: ${user.name}`);
    const headLine = `👉 Choose an option\n`;

    const feature = await UI.selectFromOptions(headLine, UI.FEATURES);

    if (feature === "EXIT") return;

    const functionality = MAPPED_FEATURES[feature];
    await functionality(user, accounts);
  }
};

const findUserByPhone = (credentialsPhone, accounts) =>
  accounts.find((each) => each.phone === credentialsPhone);

export const logInUser = async (accounts) => {
  const { phone, pass } = await UI.readLogInCredentials();
  const user = findUserByPhone(phone, accounts);

  if (!user || user.pass !== pass) {
    console.clear();
    UI.displayResult(" ❌ Credentials mismatch\n");
    return;
  }

  await grantAccess(user, accounts);
};

export const createAccount = async (accounts) => {
  const user = await UI.readCreateAccCredentials();
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
    console.clear();
  }
};
