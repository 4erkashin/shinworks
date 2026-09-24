import path from "node:path";

const isForbiddenEnv = (file: string): boolean => {
  const base = path.basename(file);
  return (
    base === ".env" || (base.startsWith(".env.") && base !== ".env.example")
  );
};

const hits = process.argv.slice(2).filter(isForbiddenEnv);

if (hits.length > 0) {
  console.error(
    [
      "forbid-env: do not commit env files (`.env`, `.env.*`).",
      "forbid-env: `.env.example` is allowed.",
      ...hits.map((file) => `  ${file}`),
    ].join("\n"),
  );
  process.exit(1);
}
