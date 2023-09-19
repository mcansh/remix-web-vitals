import { defineConfig } from "tsup";
import type { Options } from "tsup";

import pkgJSON from "./package.json";
let external = Object.keys(pkgJSON.dependencies || {});

export default defineConfig(() => {
  let options: Options = {
    entry: ["src/index.ts"],
    sourcemap: true,
    external,
    tsconfig: "./tsconfig.json",
    target: "es2020",
    dts: true,
    clean: true,
  };

  return [
    { ...options, format: "cjs" },
    { ...options, format: "esm" },
  ];
});
