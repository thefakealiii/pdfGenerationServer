import puppeteer from 'puppeteer-core';

export default async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      // Use the bundled Chromium binary
      executablePath: '/var/task/node_modules/puppeteer-core/.local-chromium/mac-1030534/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'],
      headless: true,
    });

    const htmlContent = await req.body;
    console.log('Received HTML Content:', htmlContent);

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
};
