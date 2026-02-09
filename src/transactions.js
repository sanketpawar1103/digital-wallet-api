import * as wallet from "./digital_wallet.js";
import * as UI from "./digital_wallet_ui.js";
import * as validation from "./validation.js";

export class transactionHandler {
  constructor(accounts) {
    this.accounts = accounts;
  }

  async checkBalance(user) {
    UI.header(`👤 ${user.name}\n💰 Check Balance`);
    const pin = await UI.readUpiPin();
    const balanceSuccessMsg = `🤑 Available Balance : ${user.balance}\n`;

    await wallet.PIN_FLAGS[validation.isPinMatch(pin, user.pin)](
      balanceSuccessMsg,
    );
  }

  async addBalance(user) {
    const { amount, pin } = await UI.readAddBalanceDetails(user.name);

    if (!validation.isPinMatch(pin, user.pin)) {
      await wallet.PIN_FLAGS["false"]();
      return;
    }

    wallet.depositAmount(user, amount);
    wallet.persistAccounts(this.accounts);
    await wallet.PIN_FLAGS["true"](`✅ Balance added successfully\n`);
  }

  async viewTransactionHistory(user) {
    UI.header(`👤 ${user.name}\n📊 Transaction History`);
    const pin = await UI.readUpiPin();

    await wallet.PIN_FLAGS[validation.isPinMatch(pin, user.pin)](
      user.history,
      console.table,
    );
  }

  async sendMoney(user) {
    const transactionDetails = await UI.readTransactCredentials(user.name);
    this.accounts = wallet.fetchAccounts();
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

    await UI.displayResult(wallet.TRANSACTION_STATES[transactionStatus]);
  }
}
