#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { program } from "commander";
import gen from "./commands/gen";
import check from "./commands/check";
import { list_files } from "./utils";

const package_info = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

program.enablePositionalOptions(true);

program
    .command("check")
    .description("Check if all characters are available in the font")
    .option("-d, --dir <dir...>", "The directories to check", [process.cwd()])
    .option("-e, --ext <ext...>", "The extensions to filter by", [
        "html",
        "htm",
        "md",
        "js",
        "ts",
        "jsx",
        "tsx",
        "css",
        "vue",
        "svelte",
    ])
    .option(
        "-f, --font <font...>",
        "The font files",
        list_files(process.cwd(), ["ttf", "otf", "woff", "woff2"]).map((f) =>
            f.replace(process.cwd(), "."),
        ),
    )
    .option("-q, --quiet", "Don't print anything", false)
    .action(check);

program
    .version(`${package_info.name} ${package_info.version}`)
    .argument(
        "[file...]",
        "file(s) to generate the report from, if none are given, all files in the current directory will be used",
    )
    .option(
        "-o, --output <output>",
        "output file, <name> = name of the input file, <format> = format of the output file",
        "<name>.<format>",
    )
    .option("-f, --format <format>", "output format (json, text, html, pdf)", "pdf")
    .option("-p, --pretty", "pretty print json", false)
    .option("-c, --columns <columns>", "number of columns in the output", "10")
    .option("-s, --size <size>", "size of the output (rem)", "2")
    .option("-F, --force", "overwrite output file if it exists", false)
    .option("-q, --quiet", "don't print anything", false)
    .action(gen)
    .parse(process.argv);
