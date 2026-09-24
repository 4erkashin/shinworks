import type { Connect, Plugin, ViteDevServer } from "vite";

/**
 * Node's built-in file and path libraries.
 * The `node:` prefix means "from Node itself, not from node_modules".
 */
import fs from "node:fs";
import path from "node:path";

/**
 * StyleX's Vite plugin injects a stylesheet link to this path.
 * The path is not exported by `@stylexjs/unplugin`;
 * it is copied from that package's consts file.
 */
const STYLE_X_DEV_CSS_PATH = "/virtual:stylex.css";

/**
 * Folder this file lives in is `.storybook`.
 * `import.meta.dirname` is Node's name for that folder (the old name was `__dirname`).
 * `..` walks up one folder to the project root, then into `tokens/generated`.
 * `path.resolve` turns that into a full disk path.
 */
const generatedDir = path.resolve(import.meta.dirname, "../tokens/generated");

/**
 * Vite URLs for every generated `*.stylex.ts` file.
 * Paths are relative to Vite's root,
 * so `transformRequest` hits the same modules StyleX will compile later.
 */
function generatedStylexUrls(root: string): string[] {
  if (!fs.existsSync(generatedDir)) {
    throw new Error(
      "tokens/generated is missing. Run pnpm tokens:build before Storybook.",
    );
  }

  /**
   * `readdirSync` lists files in a folder and waits until the list is ready.
   * Sync is fine here: we run once at startup, not on every request.
   */
  const files = fs
    .readdirSync(generatedDir)
    .filter((name) => name.endsWith(".stylex.ts"))
    .sort();

  if (files.length === 0) {
    throw new Error(
      "tokens/generated has no *.stylex.ts files. Run pnpm tokens:build before Storybook.",
    );
  }

  return files.map((name) => {
    /**
     * `path.join` glues folder + filename with the right slash for this OS.
     * `path.relative` is the walk from Vite's project root to that file.
     * Disk paths use `\` on Windows; URLs always use `/`,
     * so we split on `path.sep` and rejoin with `/`.
     */
    const absolute = path.join(generatedDir, name);
    const relative = path.relative(root, absolute).split(path.sep).join("/");

    /**
     * A path starting with `.` sits outside Vite's root.
     * `/@fs/` is Vite's way to load a file by its full disk path.
     * Otherwise a leading `/` is a normal project-root URL.
     */
    return relative.startsWith(".") ? `/@fs/${absolute}` : `/${relative}`;
  });
}

function preloadGeneratedStylex(server: ViteDevServer): Promise<unknown[]> {
  const urls = generatedStylexUrls(server.config.root);

  /**
   * Ask Vite to compile each file the same way it would if a page had imported it.
   * `Promise.all` starts them together and waits until every one finishes.
   */
  return Promise.all(urls.map((url) => server.transformRequest(url)));
}

/**
 * Vite can request StyleX's virtual CSS before it has compiled the
 * generated const files. StyleX then writes `var(--hash)` where a
 * media query should be, and lightningcss throws
 * `Invalid empty selector`.
 *
 * This middleware runs first. It compiles every generated
 * `*.stylex.ts` file so the const map is filled, then lets StyleX
 * serve the CSS.
 */
export function stylexConstsPreloadPlugin(): Plugin {
  return {
    configureServer(server) {
      /**
       * Vite's dev server is an HTTP server.
       * Plugins can insert functions that see each request.
       * `next()` means "I am done; pass this request to the next function".
       */
      const handle: Connect.NextHandleFunction = (req, _res, next) => {
        if (!req.url?.startsWith(STYLE_X_DEV_CSS_PATH)) {
          next();
          return;
        }

        /**
         * `void` means we start the work and do not wait here.
         * `.then` calls `next` after compile succeeds.
         * The second argument is also `next`, so a compile error
         * still gets handed to Vite instead of becoming an unhandled rejection.
         */
        void preloadGeneratedStylex(server).then(() => {
          next();
        }, next);
      };

      /**
       * StyleX is also `enforce: "pre"` and ends the CSS request.
       * Returning a function runs after every plugin has registered
       * its request handlers. `unshift` puts this handle at the front
       * of the list so consts compile before lightningcss sees the CSS.
       */
      return () => {
        server.middlewares.stack.unshift({
          handle,
          route: "",
        });
      };
    },
    /**
     * Vite runs `pre` plugins before normal ones.
     * StyleX uses the same setting, so we still `unshift` above
     * to win the race among `pre` plugins.
     */
    enforce: "pre",
    name: "storybook-stylex-consts-preload",
  };
}
