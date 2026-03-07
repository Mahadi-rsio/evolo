import { build } from "esbuild";

await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    outfile: "dist/cli.js",
    banner: { js: "#!/usr/bin/env node" },
    minify: true,
    treeShaking: true,
    external: ["node:*"], // keep Node built-ins external
});
