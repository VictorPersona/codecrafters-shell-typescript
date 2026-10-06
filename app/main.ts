import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

// TODO: Uncomment the code below to pass the first stage

rl.prompt();

rl.on("line", (command) => {
  const currcmd = command.split(" ")[0];
  switch (currcmd) {
    case "exit":
      rl.close();
      return;
    case "echo":
      const args = command.slice(5).trim();
      console.log(args);
      rl.prompt();
      return;
    default:
      console.error(`${command}: command not found`);
      rl.prompt();
      break;
  }
});
