import { spawn } from "node:child_process";
import { statSync, watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Node's `--watch-path=tokens/tokens.json` is the wrong tool here.
 *
 * On macOS it reports a fake path (`tokens/tokens.json/tokens.json`) and
 * restarts when unrelated files change — a Storybook save, a generated
 * write, anything FSEvents batches in. Storybook then sees new mtimes
 * under `tokens/generated/` and rebuilds in a loop.
 *
 * Watch the token source files, and only rebuild when that file's mtime
 * actually moved.
 */
const root = path.dirname(fileURLToPath(import.meta.url));
const buildScript = path.join(root, "build.js");
const sources = [
  "tokens.json",
  "build.js",
  "font-mono-var.ts",
  "font-sans-var.ts",
].map((name) => path.join(root, name));

let running = false;
let queued = false;

function runBuild() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  const child = spawn(process.execPath, [buildScript], { stdio: "inherit" });
  child.on("exit", (code) => {
    running = false;
    if (code !== 0) {
      console.error(`tokens/build.js exited ${code}`);
    }
    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

function watchSource(file) {
  let mtimeNs = statSync(file).mtimeNs;

  const start = () => {
    const watcher = watch(file, () => {
      let st;
      try {
        st = statSync(file);
      } catch {
        /**
         * Editors often save by replacing the file. The old watch handle
         * dies; attach a new one to the path.
         */
        watcher.close();
        start();
        return;
      }
      if (st.mtimeNs === mtimeNs) return;
      mtimeNs = st.mtimeNs;
      runBuild();
    });
  };

  start();
}

runBuild();
for (const file of sources) watchSource(file);
console.log(
  "Watching token sources. Waiting for file changes before rebuilding...",
);
