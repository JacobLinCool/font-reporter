import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import fontkit from "fontkit";
import fetch from "node-fetch";
import { list_files } from "../utils";

export default async function check(opt: {
    dir: string[];
    ext: string[];
    font: string[];
    quiet: boolean;
}): Promise<void> {
    const dirs = opt.dir.map((d) => path.resolve(d));
    const files = dirs.map((d) => list_files(d, opt.ext)).flat();
    const fonts = await Promise.all(
        opt.font.map(async (f) => {
            try {
                const url = new URL(f);

                const dist = path.resolve(
                    os.tmpdir(),
                    createHash("sha256").update(url.href).digest("hex").slice(0, 7) +
                        "-" +
                        path.basename(f),
                );

                if (!fs.existsSync(dist)) {
                    opt.quiet || console.log(`Downloading ${url.href}`);
                    await fetch(url.href).then(async (res) =>
                        fs.writeFileSync(dist, await res.buffer()),
                    );
                }

                return dist;
            } catch {
                return path.resolve(f);
            }
        }),
    );

    if (fonts.length === 0) {
        console.error("No font found");
        process.exit(1);
    }

    opt.quiet ||
        console.log(
            `Checking files ending with [ ${opt.ext.join(", ")} ] in [ ${dirs.join(", ")} ]`,
        );

    const charset = new Set<string>();

    for (const font of fonts) {
        if (!fs.existsSync(font)) {
            console.error(`Font ${font} not found`);
            process.exit(1);
        }

        opt.quiet || console.log("Loading font", font);
        const f = fontkit.openSync(font);
        for (const c of f.characterSet) {
            charset.add(String.fromCharCode(c));
        }
    }

    opt.quiet || console.log(`The selected fonts support ${charset.size} characters`);

    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.error(`File ${file} not found`);
            process.exit(1);
        }

        opt.quiet || console.log(`Checking ${file}`);
        const content = fs.readFileSync(file, "utf8");
        const chars = new Set<string>(content);
        const missing = [...chars].filter((c) => c.replace(/\s/, "") && !charset.has(c));
        if (missing.length > 0) {
            console.error(`Missing characters: ${missing.join(", ")}`);
            process.exit(1);
        }
    }

    opt.quiet || console.log("All characters are supported in the selected fonts.");
}
