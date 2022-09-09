import fs from "node:fs";
import path from "node:path";

/**
 * List all files in a directory.
 * @param dir The directory to list.
 * @param ext The extension to filter by.
 * @param depth The depth to recurse.
 * @returns The list of absolute paths to files in the directory.
 */
export function list_files(dir: string, ext: string[] = [], depth = 3): string[] {
    if (depth < 0) {
        return [];
    }

    try {
        const files = fs.readdirSync(dir);
        const result = [];

        for (const file of files) {
            if (file === "node_modules") {
                continue;
            }

            const filepath = path.resolve(dir, file);
            const stat = fs.statSync(filepath);

            if (stat.isDirectory()) {
                result.push(...list_files(filepath, ext, depth - 1));
            } else if (ext.length === 0 || ext.includes(path.extname(file).slice(1))) {
                result.push(filepath);
            }
        }

        return result;
    } catch {
        return [];
    }
}
