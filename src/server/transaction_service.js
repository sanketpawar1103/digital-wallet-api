import * as services from "./account_service.js";
import * as UI from "../frontend/cli_view.js";
import * as validation from "./validator.js";

export class transactionHandler {
  constructor(accounts) {
    this.accounts = accounts;
  }

  async checkBalance(user) {
    UI.header(`👤 ${user.name}\n💰 Check Balance`);
    const pin = await UI.readUpiPin();
    const balanceSuccessMsg = `🤑 Available Balance : ${user.balance}\n`;

    await services.PIN_FLAGS[validation.isPinMatch(pin, user.pin)](
      balanceSuccessMsg,
    );
  }

  async addBalance(user) {
    const { amount, pin } = await UI.readAddBalanceDetails(user.name);

    if (!validation.isPinMatch(pin, user.pin)) {
      await services.PIN_FLAGS["false"]();
      return;
    }

    services.depositAmount(user, amount);
    services.persistAccounts(this.accounts);
    await services.PIN_FLAGS["true"](`✅ Balance added successfully\n`);
  }

  async viewTransactionHistory(user) {
    UI.header(`👤 ${user.name}\n📊 Transaction History`);
    const pin = await UI.readUpiPin();

    await services.PIN_FLAGS[validation.isPinMatch(pin, user.pin)](
      user.history,
      console.table,
    );
  }

  async sendMoney(user) {
    const transactionDetails = await UI.readTransactCredentials(user.name);
    this.accounts = services.fetchAccounts();
    const transactionStatus = validation.isValidTransaction(
      user,
      this.accounts,
      transactionDetails,
    );

    if (transactionStatus === "ALL_RIGHT") {
      const receiver = services.findUserByPhone(
        transactionDetails.receiver,
        this.accounts,
      );

      services.applyTransaction(user, receiver, transactionDetails.amount);
      services.persistAccounts(this.accounts);
    }

    await UI.displayResult(services.TRANSACTION_STATES[transactionStatus]);
  }
}
