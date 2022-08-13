import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: ["src/index.ts"],
    outDir: "dist",
    target: "node16",
    format: ["cjs"],
    shims: true,
    clean: true,
    splitting: false,
    minify: !options.watch,
    dts: false,
    loader: {
        ".html": "text",
    },
}));
