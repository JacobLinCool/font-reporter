import fs from "node:fs";
import path from "node:path";

/**
 * List all files in a directory.
 * @param dir The directory to list.
 * @param ext The extension to filter by.
 * @returns The list of absolute paths to files in the directory.
 */
export function list_files(dir: string, ext: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    const result = [];

    for (const file of files) {
        const filepath = path.resolve(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
            result.push(...list_files(filepath, ext));
        } else if (ext.length === 0 || ext.includes(path.extname(file).slice(1))) {
            result.push(filepath);
        }
    }

    return result;
}
