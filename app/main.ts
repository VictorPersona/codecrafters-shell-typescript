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
  const args = input.slice(command.length + 1);
  const exit = () => {
    rl.close();
    return;
  };
  const echo = (args: string) => {
    console.log(args);
    rl.prompt();
    return;
  };
  const defaultBehaviour = (command: string) => {
    console.error(`${command}: command not found`);
    rl.prompt();
    return;
  };
  const type = (command: string) => {
    if (Object.hasOwn(commandToFunction, command)) {
      console.log(`${command} is a shell builtin`);
    } else {
      console.log(`${command}: not found`);
    }
    rl.prompt();
  };
  const commandToFunction: Record<string, Function> = {
    exit,
    echo,
    type,
  };
  // switch (command) {
  //   case "exit":
  //     rl.close();
  //     return;
  //   case "echo":
  //     console.log(args);
  //     rl.prompt();
  //     return;
  //   default:
  //     console.error(`${command}: command not found`);
  //     rl.prompt();
  //     break;
  // }
  if (Object.hasOwn(commandToFunction, command)) {
    commandToFunction[command](args);
  } else {
    defaultBehaviour(command);
  }
});
