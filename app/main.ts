import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

// TODO: Uncomment the code below to pass the first stage

rl.prompt();

rl.on("line", (command) => {
  const parts = command.split(" ");
  const currcmd = parts[0];
  const args = parts.slice(1);
  switch (currcmd) {
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
