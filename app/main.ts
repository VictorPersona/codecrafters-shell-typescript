import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "readline";
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

rl.prompt();

const exit = () => {
  rl.close();
  return { shouldContinue: false };
};
const echo = (args: string) => {
  console.log(args);
  return { shouldContinue: true };
};
const defaultBehaviour = (command: string) => {
  console.log(`${command}: command not found`);
  return { shouldContinue: true };
};
const checkInDir = (dir: string, command: string) => {
  const fullPath = path.join(dir, command);
  try {
    if (!fs.statSync(fullPath).isFile()) return { doesExist: false };
    fs.accessSync(fullPath, fs.constants.X_OK);
    return { doesExist: true, fullPath };
  } catch (error) {
    return { doesExist: false };
  }
};

const checkAllDirsForExecute = (Dirs: string, command: string) => {
  const dirs = Dirs.split(":");
  for (let d of dirs) {
    const dirStatus = checkInDir(d, command);
    if (dirStatus.doesExist) {
      return dirStatus.fullPath;
    }
  }
  return null;
};

const type = (command: string) => {
  const doesExist = checkWhetherCommandExists(command);
  if (doesExist.doesExist) {
    if (doesExist.isBuiltin) {
      console.log(`${command} is a shell builtin`);
    } else {
      console.log(`${command} is ${doesExist.path}`);
    }
  } else {
    console.log(`${command}: not found`);
  }
  return { shouldContinue: true };
};
const pwd = () => {
  console.log(process.cwd());
  return { shouldContinue: true };
};
const commandToFunction: Record<
  string,
  (args: string) => { shouldContinue: boolean }
> = {
  exit,
  echo,
  type,
  pwd,
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

const runCommand = (
  command: string,
  args: string,
): { shouldContinue: boolean } => {
  const commandExistence = checkWhetherCommandExists(command);
  if (commandExistence.doesExist) {
    if (commandExistence.isBuiltin) {
      return commandToFunction[command](args);
    }
    const executableCommand = `"${command}" ${args}`;
    try {
      execSync(executableCommand, { stdio: "inherit" });
    } catch (error) {}
    return { shouldContinue: true };
  }
  return defaultBehaviour(command);
};

rl.on("line", (input) => {
  const parts = input.split(" ");
  const command = parts[0];
  const args = input.slice(command.length + 1);
  const result = runCommand(command, args);

  if (result.shouldContinue) rl.prompt();
});
