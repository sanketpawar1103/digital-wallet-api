import { fetchAccounts, walletService } from "./src/backend/account_service.js";

const main = () => {
  console.clear();

  walletService(fetchAccounts());
};

main();
