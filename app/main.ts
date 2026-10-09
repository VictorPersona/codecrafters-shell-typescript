import { createInterface } from "readline";
import fs from "node:fs";
import path from "node:path";
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
    console.log(`${command}: command not found`);
    rl.prompt();
    return;
  };
  const checkInDir = (dir: string, command: string) => {
    // console.error(dir);
    const doesDirExist = fs.existsSync(dir);
    if (doesDirExist) {
      const entriesInDir: fs.Dirent[] = fs.readdirSync(dir, {
        withFileTypes: true,
      });
      for (let entry of entriesInDir) {
        if (
          path.parse(entry.name).name == command &&
          (entry.isFile() || entry.isSymbolicLink())
        ) {
          const fullPath = path.join(dir, entry.name);
          try {
            fs.accessSync(fullPath, fs.constants.X_OK);
            return { doesExist: true, fullPath };
          } catch (error) {
            // console.error(error);
          }
        }
      }
    }
    return { doesExist: false };
  };
  const checkAllDirsForExecute = (Dirs: string, command: string) => {
    const dirs = Dirs.split(":");
    // console.error(dirs);
    for (let d of dirs) {
      const dirStatus = checkInDir(d, command);
      if (dirStatus.doesExist) {
        return `${command} is ${dirStatus.fullPath}`;
      }
    }
    return `${command}: not found`;
  };
  const type = (command: string) => {
    if (Object.hasOwn(commandToFunction, command)) {
      console.log(`${command} is a shell builtin`);
      rl.prompt();
      return;
    }
    const givenPath = process.env.PATH || "";
    // console.error(givenPath);
    console.log(checkAllDirsForExecute(givenPath, command));
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
