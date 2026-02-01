import { input, number, password, select } from "@inquirer/prompts";

export const ACTIONS = [
  { name: "📝  Create New Account", value: "CREATE" },
  { name: "🔑  Log In", value: "LOGIN" },
  { name: "❌  Close Application", value: "EXIT" },
];

export const FEATURES = [
  { name: "💰  Balance Enquiry ", value: "BALANCE" },
  { name: "💸  Send Money", value: "SEND_MONEY" },
  { name: "➕💰  Add Balance ", value: "DEPOSIT" },
  { name: "📊  Transaction History ", value: "HISTORY" },
  { name: "🚪  Log Out ", value: "EXIT" },
];

export const displayResult = (msg) => {
  console.log(msg);
};

export const selectFromOptions = async (message, choices) => {
  const choice = await select({ message, choices });

  return choice;
};

const readUserName = async () => {
  const nameErr = "* Name must be 3-50 letters only";

  const name = await input({
    message: `${"👤  Full Name".padEnd(21)} :`,
    validate: (name) => /^[A-Za-z ]{3,50}$/.test(name) ? true : nameErr,
  });

  return name;
};

export const readPhoneNumber = async (message) => {
  const phoneErr = "* Invalid phone number";

  const phone = await input({
    message,
    validate: (phone) => /^[6-9]\d{9}$/.test(phone) ? true : phoneErr,
  });

  return phone;
};

const readInitialBalance = async () => {
  const balanceErr = "* Initial balance must be at least of 100rs";

  const balance = await number({
    message: `${"💰  Initial Balance".padEnd(21)} :`,
    required: true,
    validate: (amount) => amount > 100 ? true : balanceErr,
  });

  return balance;
};

export const readPassword = async () => {
  const passErr = "* Password must be at least 4 characters";

  const pass = await password({
    message: `${"🔓  Password".padEnd(21)} :`,
    mask: true,
    validate: (pass) => /^.{4,}$/.test(pass) ? true : passErr,
  });

  return pass;
};

export const readUpiPin = async () => {
  const pinErr = "* Pin must be exactly 4 digits";

  const pin = await password({
    message: `${"🔑  UPI PIN (4-digit)".padEnd(21)} :`,
    mask: true,
    validate: (pin) => /^\d{4}$/.test(pin) ? true : pinErr,
  });

  return pin;
};

const readAmount = async () => {
  const amountErr = "* Enter valid(positive) amount";

  const amount = await number({
    message: `${"💰  Amount To Send".padEnd(21)} :`,
    required: true,
    validate: (amount) => amount > 0 ? true : amountErr,
  });

  return amount;
};

export const readCreateAccCredentials = async () => {
  console.clear();
  console.log("\t| CREATE ACCOUNT |\n");
  const name = await readUserName();
  const phone = await readPhoneNumber(`${"📲  Phone Number".padEnd(21)} :`);
  const balance = await readInitialBalance();
  const pass = await readPassword();
  const pin = await readUpiPin();

  return { name, phone, balance, pass, pin, history: [] };
};

export const readLogInCredentials = async () => {
  console.clear();
  console.log("\t| LOG IN PAGE |\n");
  const phone = await readPhoneNumber(`${"📲  Phone Number".padEnd(21)} :`);
  const pass = await readPassword();

  return { phone, pass };
};

export const readTransactCredentials = async (user) => {
  console.clear();
  console.log(`User: ${user.name}\n`);
  const phone = await readPhoneNumber(
    `${"📲  Receiver's Phone".padEnd(21)} :`,
  );
  const amount = await readAmount();
  const pin = await readUpiPin();

  return { phone, amount, pin };
};
