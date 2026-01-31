import { select } from "@inquirer/prompts";

export const selectFromOptions = async (headLine, options) => {
  const choice = await select({ message: headLine, choices: options });

  return choice;
};

export const ACTIONS = [
  { name: "📝  Create New Account", value: "CREATE" },
  { name: "🔑  Log In", value: "LOGIN" },
  { name: "❌  Close Application", value: "EXIT" },
];
