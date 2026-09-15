import puppeteer, { type Browser } from "puppeteer";

let browserPromise: Promise<Browser> | null = null;

function getBrowser() {
  browserPromise ??= puppeteer.launch({ headless: true });
  return browserPromise;
}

export async function renderPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm", left: "16mm", right: "16mm" } });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}
