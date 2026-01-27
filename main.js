import { walletService } from "./src/digital_wallet.js";

const main = () => {
  console.clear();

  const accounts = JSON.parse(
    Deno.readTextFileSync("./database/accounts.json"),
  );

  walletService(accounts);
};

main();
