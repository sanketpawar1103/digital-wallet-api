// import { fetchAccounts, walletService } from "./src/backend/account_service.js";

import { createApp } from "./src/server/transaction_router.js";

// const main = () => {
//   console.clear();

//   walletService(fetchAccounts());
// };

// main();

const main = () => {
  const app = createApp();
  Deno.serve({ port: 8000 }, app.fetch);
};

main();
