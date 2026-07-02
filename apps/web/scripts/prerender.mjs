import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve, join } from "path";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const routes = [
  "/docs/introduction",
  "/docs/installation",
  "/docs/getting-started",
  "/docs/contributing",
  "/docs/commands",
  "/docs/the-guard",
  "/docs/what-arven-detects",
  "/docs/ci-integration",
  "/docs/faq",
];

// Find the SSR bundle output
const distSsrDir = resolve(root, "dist-ssr");
const files = readdirSync(distSsrDir);
const ssrFile = files.find((f) => f.startsWith("ssr") && (f.endsWith(".js") || f.endsWith(".mjs") || f.endsWith(".cjs")));
if (!ssrFile) {
  console.error("Could not find SSR output in dist-ssr/");
  process.exit(1);
}

const { render } = await import(pathToFileURL(join(distSsrDir, ssrFile)).href);

const template = readFileSync(resolve(root, "dist", "index.html"), "utf-8");

for (const route of routes) {
  const appHtml = render(route);

  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );

  const outDir = resolve(root, "dist", route.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`Pre-rendered: ${route}`);
}

console.log("All docs pages pre-rendered successfully!");
