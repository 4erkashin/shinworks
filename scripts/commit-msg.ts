import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Contract = {
  exceptions: string[];
  types: string[];
};

const repoRoot = (): string => {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return path.join(import.meta.dirname, "..");
  }
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isContract = (value: unknown): value is Contract => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("types" in value) || !("exceptions" in value)) {
    return false;
  }
  return isStringArray(value.types) && isStringArray(value.exceptions);
};

const readContract = (root: string): Contract => {
  const configPath = path.join(root, "conventional-commits.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`commit-msg: missing ${configPath}`);
  }

  const data: unknown = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!isContract(data) || data.types.length === 0) {
    throw new Error(
      "commit-msg: conventional-commits.json must have a non-empty `types` array and an `exceptions` array",
    );
  }

  return data;
};

const subjectLine = (msgFile: string): string | undefined =>
  fs
    .readFileSync(msgFile, "utf8")
    .replace(/\r/g, "")
    .split("\n")
    .find((line) => line.trim() !== "" && !line.startsWith("#"));

const escapeRe = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function loadContract(): Contract {
  try {
    return readContract(repoRoot());
  } catch (error) {
    fail(
      error instanceof Error ? error.message : "commit-msg: invalid contract",
    );
  }
}

const msgFile = process.argv[2];
if (!msgFile || !fs.existsSync(msgFile)) {
  fail("commit-msg: missing commit message file");
}

const contract = loadContract();
const subject = subjectLine(msgFile);
if (!subject) {
  fail("commit-msg: empty commit message");
}

if (contract.exceptions.some((prefix) => subject.startsWith(prefix))) {
  process.exit(0);
}

const typeAlt = contract.types.map(escapeRe).join("|");
const header = new RegExp(
  `^(${typeAlt})(\\([a-zA-Z0-9._/-]+\\))?(!)?: \\S.*$`,
  "i",
);

if (header.test(subject)) {
  process.exit(0);
}

fail(
  [
    `commit-msg: expected 'type: subject' (${contract.types.join("|")}).`,
    `commit-msg: got: ${subject}`,
    `commit-msg: see README "Commit messages" for scope and breaking !`,
  ].join("\n"),
);
