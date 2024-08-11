// index.js
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from 'chromium';

export async function middleware(request, event) {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromium.path,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add necessary arguments
    });

    const htmlContent = await request.json(); // Get HTML content from the request body
    console.log('Received HTML Content:', htmlContent); // Log the received HTML for debugging

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=report.pdf',
      },
    });
  } catch (err) {
    console.error('Error generating PDF:', err); // Log the error to the console
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}

export const config = {
  runtime: 'edge',
};
