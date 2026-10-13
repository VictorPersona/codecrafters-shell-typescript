import { createInterface } from "readline";
import fs from "node:fs";
import path from "node:path";
import { isBuiltin } from "node:module";
import { exec, execSync } from "node:child_process";
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
  const checkIfExternalExists = (Dirs: string, command: string) => {
    const dirPath = checkAllDirsForExecute(Dirs, command);
    if (dirPath != null) {
      return `${command} is ${dirPath}`;
    }
    return `${command}: not found`;
  };
  const checkAllDirsForExecute = (Dirs: string, command: string) => {
    const dirs = Dirs.split(":");
    // console.error(dirs);
    for (let d of dirs) {
      const dirStatus = checkInDir(d, command);
      if (dirStatus.doesExist) {
        return dirStatus.fullPath;
      }
    }
    return null;
  };
  const checkWhetherCommandExists = (command: string) => {
    if (Object.hasOwn(commandToFunction, command)) {
      return { doesExist: true, isBuiltin: true };
    }
    const givenPath = process.env.PATH || "";
    const dirPath = checkAllDirsForExecute(givenPath, command);
    if (dirPath != null) {
      return { doesExist: true, isBuiltin: false, path: dirPath };
    }
    return { doesExist: false };
  };
  const type = (command: string) => {
    if (Object.hasOwn(commandToFunction, command)) {
      console.log(`${command} is a shell builtin`);
      rl.prompt();
      return;
    }
    const givenPath = process.env.PATH || "";
    // console.error(givenPath);
    console.log(checkIfExternalExists(givenPath, command));
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
  const commandExistence = checkWhetherCommandExists(command);
  if (commandExistence.doesExist) {
    if (commandExistence.isBuiltin) {
      commandToFunction[command](args);
    } else {
      let executableCommand = `"${command}" ${args}`;
      // console.error(executableCommand);
      execSync(executableCommand, { stdio: "inherit" });
      rl.prompt();
    }
  } else {
    defaultBehaviour(command);
  }
});
