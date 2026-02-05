import * as wallet from "./digital_wallet.js";
import * as UI from "./digital_wallet_ui.js";
import * as validation from "./validation.js";

export class transactionHandler {
  constructor(accounts) {
    this.accounts = accounts;
  }

  async checkBalance(user) {
    console.clear();
    UI.displayResult(` ${user.name}\n`);
    const pin = await UI.readUpiPin();
    const balanceSuccessMsg = ` 🤑 Available Balance : ${user.balance}\n`;

    wallet.PIN_FLAGS[validation.isPinMatch(pin, user.pin)](balanceSuccessMsg);
  }

  async addBalance(user) {
    UI.displayResult(` ${user.name}\n`);
    const { amount, pin } = await UI.readAddBalanceDetails();

    if (!validation.isPinMatch(pin, user.pin)) {
      wallet.PIN_FLAGS["false"]();
      return;
    }

    wallet.recordTransaction(user, amount);
    wallet.PIN_FLAGS["true"](` ✅ Balance added successfully\n`);

    wallet.depositAmount(user, amount, this.accounts);
  }

  async viewTransactionHistory(user) {
    console.clear();
    console.log(` ${user.name}\n`);
    const pin = await UI.readUpiPin();
    console.clear();

    wallet.PIN_FLAGS[validation.isPinMatch(pin, user.pin)](
      user.history,
      console.table,
    );
  }

  async sendMoney(user) {
    const transactionDetails = await UI.readTransactCredentials(user);
    const transactionStatus = validation.isValidTransaction(
      user,
      this.accounts,
      transactionDetails,
    );

    if (transactionStatus === "ALL_RIGHT") {
      const receiver = wallet.findUserByPhone(
        transactionDetails.receiver,
        this.accounts,
      );
      wallet.applyTransaction(user, receiver, transactionDetails.amount);
      wallet.persistAccounts(this.accounts);
    }

    UI.displayResult(wallet.TRANSACTION_STATES[transactionStatus]);
  }
}
