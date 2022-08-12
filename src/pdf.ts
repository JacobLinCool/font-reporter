import fs from "node:fs";
import { launch } from "puppeteer-core";

export async function html_to_pdf(html: string): Promise<Buffer> {
    const chrome_path = find_chrome();

    if (!chrome_path) {
        throw new Error("Chrome not found");
    }

    const browser = await launch({ executablePath: chrome_path });

    const page = await browser.newPage();
    await page.setContent(html, { timeout: 120_000 });
    const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        timeout: 120_000,
    });

    browser.close();

    return buffer;
}

function find_chrome(): string {
    const chrome_path = process.env.CHROME_PATH;
    if (chrome_path) {
        return chrome_path;
    }

    const candidates: Partial<Record<typeof process.platform, string[]>> = {
        win32: [
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\chrome.exe",
            "C:\\Program Files\\Google\\Chrome\\chrome.exe",
        ],
        darwin: [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
        ],
        linux: [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome-unstable",
            "/usr/bin/google-chrome-beta",
            "/usr/bin/google-chrome-dev",
        ],
    };

    let location = "";

    if (candidates[process.platform]) {
        for (const candidate of candidates[process.platform] as string[]) {
            if (fs.existsSync(candidate)) {
                location = candidate;
                break;
            }
        }
    }

    return location;
}
