import { execFileSync } from "node:child_process";

const marker = /^(<<<<<<<|=======|>>>>>>>)/m;

const stagedContents = (file: string): string | undefined => {
  try {
    const buf = execFileSync("git", ["show", `:${file}`], {
      maxBuffer: 32 * 1024 * 1024,
    });
    if (buf.includes(0)) {
      return undefined;
    }
    return buf.toString("utf8");
  } catch {
    return undefined;
  }
};

const hits = process.argv.slice(2).filter((file) => {
  const contents = stagedContents(file);
  return contents !== undefined && marker.test(contents);
});

if (hits.length > 0) {
  console.error(
    `conflict-markers: resolve conflict markers in:\n${hits.map((file) => `  ${file}`).join("\n")}`,
  );
  process.exit(1);
}
