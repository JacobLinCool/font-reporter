#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { program } from "commander";
import gen from "./commands/gen";

const package_info = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

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
    .option("-s, --size <size>", "size of the output", "1")
    .option("-F, --force", "overwrite output file if it exists", false)
    .option("-q, --quiet", "don't print anything", false)
    .action(gen)
    .parse(process.argv);
