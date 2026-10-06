import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

// TODO: Uncomment the code below to pass the first stage

rl.prompt();

rl.on("line", (input) => {
  const parts = input.split(" ");
  const command = parts[0];
  const args = input.slice(command.length);
  switch (command) {
    case "exit":
      rl.close();
      return;
    case "echo":
      console.log(args);
      rl.prompt();
      return;
    default:
      console.error(`${command}: command not found`);
      rl.prompt();
      break;
  }
});
