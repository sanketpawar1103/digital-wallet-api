import { getCookie } from "hono/cookie";

export const doNotAllowLoggedUser = async (context) => {
  if (getCookie(context, "username")) {
    return context.redirect("/");
  }

  await context.next();
};

export const findUserByPhone = (credentialsPhone, accounts) =>
  accounts.find((each) => each.phone === credentialsPhone);

export const logInUser = async (context) => {
  const user = findUserByPhone(phone, accounts);

  if (user && user.pass === pass) {
    console.clear();
    await grantAccess(user, accounts);
    return;
  }

  await UI.displayResult(
    "❌ Credentials Mismatch\n",
  );
};

export const createAccount = async (accounts) => {
  const user = await UI.readCreateAccCredentials();

  if (findUserByPhone(user.phone, accounts)) {
    await UI.displayResult(
      `⚠️ User already exists with this phone number\n`,
    );

    return;
  }

  await UI.displayResult(`✅ Account Created Successfully\n`);
  accounts.push(user);
  persistAccounts(accounts);
};
