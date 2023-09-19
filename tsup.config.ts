import { defineConfig } from "tsup";

import pkgJSON from "./package.json";
let external = Object.keys(pkgJSON.dependencies || {});

export default defineConfig(() => {
  return {
    entry: ["src/index.ts"],
    sourcemap: true,
    external,
    tsconfig: "./tsconfig.json",
    target: "es2020",
    dts: true,
    clean: true,
    format: ["cjs", "esm"],
    treeshake: true,
    cjsInterop: true,
  };
});
