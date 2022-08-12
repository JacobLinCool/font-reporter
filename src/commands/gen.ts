import fs from "node:fs";
import path from "node:path";
import fontkit, { Font } from "fontkit";
import { OptionValues } from "commander";
import { Char } from "../types";
import { html_to_pdf } from "../pdf";

export default async function gen(files: string[], opt: OptionValues): Promise<void> {
    const cwd = process.cwd();

    if (files.length === 0) {
        const accepted = ["ttf", "otf", "woff", "woff2"];
        files.push(
            ...fs.readdirSync(cwd).filter((f) => accepted.includes(f.split(".").pop() || "")),
        );

        if (files.length === 0) {
            console.error(`No font found in current directory ${cwd}`);
            process.exit(1);
        }
    }

    for (let i = 0; i < files.length; i++) {
        files[i] = path.resolve(cwd, files[i]);
    }

    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.error(`File ${file} not found`);
            process.exit(1);
        }
    }

    const checked = new Set<string>();
    for (const file of files) {
        const name = path.basename(file).split(".").slice(0, -1).join(".");
        const font = fontkit.openSync(file);
        const chars = parse(font);

        if (checked.has(name)) {
            continue;
        }
        checked.add(name);

        if (opt.format === "text") {
            opt.format = "txt";
        }

        const out = path.resolve(
            opt.output.replace("<name>", name).replace("<format>", opt.format),
        );

        if (opt.format === "json") {
            fs.writeFileSync(out, JSON.stringify(chars, null, opt.pretty ? 4 : 0));
        } else if (opt.format === "txt") {
            fs.writeFileSync(out, generate_text(font, chars, opt.columns));
        } else if (opt.format === "html") {
            fs.writeFileSync(out, generate_html(font, chars, opt.columns, opt.size));
        } else if (opt.format === "pdf") {
            const buffer = await html_to_pdf(
                generate_html(font, chars, opt.columns, opt.size).replace(/loading="lazy"/g, ""),
            );
            fs.writeFileSync(out, buffer);
        } else {
            console.error(`Unknown format ${opt.format}`);
            process.exit(1);
        }

        if (!opt.quiet) {
            console.log(`${out} generated`);
        }
    }
}

function parse(font: Font): Char[] {
    return font.characterSet
        .map((c) => {
            const glyph = font.glyphForCodePoint(c);
            return {
                code: c,
                char: String.fromCharCode(c),
                path: glyph.path.toSVG(),
                bbox: glyph.bbox,
            };
        })
        .filter((c) => c.path.length > 0);
}

function generate_text(font: Font, chars: Char[], col = 16) {
    const rows: Char[][] = [];
    let row: Char[] = [];
    for (let i = 0; i < chars.length; i++) {
        row.push(chars[i]);
        if (i % col === col - 1) {
            rows.push(row);
            row = [];
        }
    }
    if (row.length) {
        rows.push(row);
    }

    const out: string[] = [];

    out.push(
        `### Font Report Generated by font-reporter (https://github.com/JacobLinCool/font-reporter) ###`,
    );

    out.push(
        [
            `Name       : ${font.fullName}`,
            `Version    : ${font.version}`,
            `Copyright  : ${font.copyright.replace(/\s+/g, " ")}`,
            `Characters : ${chars.length}`,
        ].join("\n"),
    );

    out.push(
        rows
            .map((row) =>
                row.map((c) => `${c.code.toString().padStart(5)} [${c.char}]`).join(" | "),
            )
            .join("\n"),
    );

    return out.join("\n\n");
}

function generate_html(font: Font, chars: Char[], col = 16, size = 2) {
    const rows: Char[][] = [];
    let row: Char[] = [];
    for (let i = 0; i < chars.length; i++) {
        row.push(chars[i]);
        if (i % col === col - 1) {
            rows.push(row);
            row = [];
        }
    }
    if (row.length) {
        rows.push(row);
    }

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${font.fullName}</title>
    <meta name="description" content="${font.version} | ${font.copyright}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        img { height: ${size}rem; width: ${size}rem }
    </style>
</head>
<body>
    <h1>${font.fullName}</h1>
    <p> <b>${font.version}</b> ${font.copyright}</p>
    <p> <b>${chars.length}</b> Unicode Characters </p>
    <table>
        <tbody>
${rows
    .map(
        (row) =>
            `<tr>${row
                .map(
                    (c) =>
                        `<td><img src="${svg_url(char_to_svg(c))}" alt="${
                            c.char
                        }" loading="lazy" /><p>[${c.char}]<br />${c.code}</p></td>`,
                )
                .join("")}</tr>`,
    )
    .join("\n")}
        </tbody>
    </table>
</body>
`;
}

function char_to_svg(char: Char): string {
    const { minX, minY, maxX, maxY } = char.bbox;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${
        maxY - minY
    }" style="transform: scaleX(-1) rotate(180deg)"><path d="${char.path}" /></svg>`;
}

function svg_url(svg: string) {
    return (
        "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22")
    );
}
