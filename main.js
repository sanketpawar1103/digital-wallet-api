import { fetchAccounts, walletService } from "./src/digital_wallet.js";

const main = () => {
  console.clear();

  walletService(fetchAccounts());
};

main();
