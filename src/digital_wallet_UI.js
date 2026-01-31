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

export const selectFromOptions = async (headLine, options) => {
  const choice = await select({ message: headLine, choices: options });

  return choice;
};

const readUserName = async () => {
  const name = await input({
    message: `${"👤  Full Name".padEnd(21)} :`,
    validate: (name) =>
      /^[A-Za-z ]{3,50}$/.test(name) ? true : "Name must be 3-50 letters only",
  });

  return name;
};

const readPhoneNumber = async (message) => {
  const phone = await input({
    message,
    validate: (phone) =>
      /^[6-9]\d{9}$/.test(phone) ? true : "Invalid phone number",
  });

  return phone;
};

const readInitialBalance = async () => {
  const balance = await number({
    message: `${"💰  Initial Balance".padEnd(21)} :`,
    required: true,
    validate: (amount) =>
      amount > 100 ? true : "Initial balance must be at least of 100rs",
  });

  return balance;
};

const readPassword = async () => {
  const pass = await password({
    message: `${"🔓  Password".padEnd(21)} :`,
    mask: true,
    validate: (pass) =>
      /^.{4,}$/.test(pass) ? true : "Password must be at least 4 characters",
  });

  return pass;
};

const readUpiPin = async () => {
  const pin = await password({
    message: `🔑  UPI PIN (4-digit) :`,
    mask: true,
    validate: (pin) =>
      /^\d{4}$/.test(pin) ? true : "Pin must be exactly 4 digits",
  });

  return pin;
};

export const readCreateAccCredentials = async () => {
  // console.clear();
  console.log("\t| CREATE ACCOUNT |\n");
  const name = await readUserName();
  const phone = await readPhoneNumber(`${"📲  Phone Number".padEnd(21)} :`);
  const balance = await readInitialBalance();
  const pass = await readPassword();
  const pin = await readUpiPin();

  return { name, phone, balance, pass, pin, history: [] };
};

export const readLogInCredentials = async () => {
  // console.clear();
  console.log("\t| LOG IN PAGE |\n");
  const phone = await readPhoneNumber(`${"📲  Phone Number".padEnd(21)} :`);
  const pass = await readPassword();

  return { phone, pass };
};
