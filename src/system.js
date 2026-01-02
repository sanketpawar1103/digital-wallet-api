import { promptSecret } from "@std/cli";

const doesExist = (user, users) =>
  users.some((each) => each.phone === user.phone);

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

const checkBalance = (user, users) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret(" Enter your pin number :");
  console.clear();

  const msg = pin === user.pin
    ? ` ✅ User : ${user.name}\n Account Balance = ${user.balance}\n`
    : ` ❌ Invalid Pin ${user.name}\n`;
  console.log(msg);

  return grauntAccess(user, users);
};

const readDetails = (user) => {
  console.log(` ${user.name}\n`);
  const phone = prompt(" Enter receiver's phone number :");
  const amount = parseInt(prompt("Enter amount :"));
  const pin = promptSecret("Enter transaction pin :");
  console.clear();

  return { phone, amount, pin };
};

const areValidDetails = (user, users, details) => {
  const receiver = users.find((each) => each.phone === details.phone);

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

const sendMoney = (user, users) => {
  if (areValidDetails(user, users, readDetails(user))) {
    console.log(` ✅ Transaction Successfull ${user.name}\n`);
  }

  return grauntAccess(user, users);
};

const getStatements = (user, users) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter your pin :");
  console.clear();

  const msg = pin === user.pin
    ? ` ${user.name}'s Statements\n${user.history.join("\n")}\n`
    : ` ❌ Invalid pin ${user.name}`;
  console.log(msg);

  return grauntAccess(user, users);
};

const addBalance = (user, users) => {
  console.log(` ${user.name}\n`);
  const pin = promptSecret("Enter pin :");
  const amount = parseInt(prompt("Enter amount :"));
  console.clear();

  if (pin !== user.pin || Number.isNaN(amount) || amount < 0) {
    console.log(` ❌ Invalid pin or amount value ${user.name}`);
    return grauntAccess(user, users);
  }

  console.log(` ✅ Balance added successfully ${user.name}`);
  user.balance += amount;
  return grauntAccess(user, users);
};

const exitPage = (_user, users) => {
  console.clear();

  return main(users);
};

const ACTIONS = {
  1: checkBalance,
  2: sendMoney,
  3: getStatements,
  4: addBalance,
  5: exitPage,
};

const grauntAccess = (user, users) => {
  let msg = `\n 1. Checke balance\n 2. Send money\n `;
  msg += `3. Get statements\n 4. Add balance\n 5. Exit page\n\n`;
  const choice = prompt(msg);
  console.clear();

  if (!(choice in ACTIONS)) {
    console.log(` ❌ Invalid CHOICE ${user.name}`);
    return grauntAccess(user, users);
  }

  return ACTIONS[choice](user, users);
};

const isInValidUser = (user, users) => {
  console.clear();
  if (!user.name || user.name.includes(",")) {
    console.log(" ❌ Empty name or remove ,\n");
    return true;
  } else if (user.phone.length !== 10 || user.phone.includes(",")) {
    console.log(" ❌ Phone number should be of 10 digits Or remove ,\n");
    return true;
  } else if (user.pass.length < 4 || user.pass.includes(",")) {
    console.log(" ❌ Password should be atleast of 4 charachters remove ,\n");
    return true;
  } else if (user.pin.length !== 4 || user.pin.includes(",")) {
    console.log(" ❌ Pin should be of 4 chars only remove ,\n");
    return true;
  } else if (Number.isNaN(user.balance) || user.balance < 0) {
    console.log(" ❌ Invalid balance amount, \n");
    return true;
  } else if (doesExist(user, users)) {
    console.log(" ❌ User already exists, \n");
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

const formatUsersData = (users) => {
  Deno.readTextFileSync("./data.csv")
    .split("\n")
    .forEach((each) => {
      const user = each.split(",");
      users.push({
        name: user[0],
        phone: user[1],
        balance: user[2],
        pass: user[3],
        pin: user[4],
        history: user.slice(5),
      });
    });

  return users;
};

const authenticateUser = (credentials, users) =>
  users.find((each) =>
    each.phone === credentials.phone && each.pass === credentials.pass
  );

const logIn = (users) => {
  const user = authenticateUser(readCredentials(), users);
  console.clear();

  if (!user) {
    console.log(" ❌ Credentials missmatch\n");
    return main(users);
  }

  console.log(`\tWelcome ${user.name}`);
  return grauntAccess(user, users);
};

const createAccount = (users) => {
  const user = readUserDetails();
  if (isInValidUser(user, users)) {
    return main(users);
  }

  console.log(" ✅ Account created successfylly\n");
  users.push(user);

  return main(users);
};

const exitHome = (users) =>
  Deno.writeTextFileSync(
    "./data.csv",
    users.map((each) => Object.values(each).join(",")).join("\n"),
  );

const CHOICES = {
  1: createAccount,
  2: logIn,
  3: exitHome,
};

const main = (users) => {
  const choice = prompt(" 1. Create Account\n 2. Log In\n 3. Exit\n\n");

  if (!(choice in CHOICES)) {
    console.clear();
    console.log(" ❌ Invalid CHOICE\n");
    return main(users);
  }

  return CHOICES[choice](users);
};

main(formatUsersData([]));
