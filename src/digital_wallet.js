import * as UI from "./digital_wallet_ui.js";
import { transactionHandler } from "./transactions.js";

export const persistAccounts = (accounts) =>
  Deno.writeTextFileSync(
    "./database/accounts.json",
    JSON.stringify(accounts, null, 2),
  );

export const applyTransaction = (sender, receiver, amount) => {
  const date = new Date().toLocaleString();
  const Amount = amount;

  receiver.history.push({
    Date: date,
    Description: `Received From: ${sender.name}`,
    Amount,
  });

  sender.history.push({
    Date: date,
    Description: `Paid To: ${receiver.name}`,
    Amount: -Amount,
  });

  receiver.balance += amount;
  sender.balance -= amount;
};

export const PIN_FLAGS = {
  true: (successMsg, logger = console.log) =>
    UI.displayResult(successMsg, logger),
  false: () => UI.displayResult(`❗️ Error pin : Pin mismatch\n`),
};

export const TRANSACTION_STATES = {
  ALL_RIGHT: "✅ Transaction Successful 🎉\n",
  INVALID_PHONE: "❗️ Error phone : Receiver not found\n",
  INSUFFICIENT_BALANCE: "❗️ Error balance : Insufficient balance\n",
  PIN_MISMATCH: "❗️ Error pin : Pin mismatch\n",
};

export const recordTransaction = (user, Amount) => {
  const date = new Date().toLocaleString();
  user.history.push({
    Date: date,
    Description: `Deposited Amount`,
    Amount,
  });
};

export const depositAmount = (user, amount, accounts) => {
  user.balance += amount;
  persistAccounts(accounts);
};

const MAPPED_FEATURES = {
  BALANCE: "checkBalance",
  SEND_MONEY: "sendMoney",
  DEPOSIT: "addBalance",
  HISTORY: "viewTransactionHistory",
};

const grantAccess = async (user, accounts) => {
  console.clear();
  const tHandle = new transactionHandler(accounts);

  while (true) {
    UI.displayResult(` User: ${user.name}`);
    const headLine = `👉 Choose an option\n`;

    const feature = await UI.selectFromOptions(headLine, UI.FEATURES);

    if (feature === "EXIT") return;

    const functionality = MAPPED_FEATURES[feature];
    await tHandle[functionality](user);
  }
};

export const findUserByPhone = (credentialsPhone, accounts) =>
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
