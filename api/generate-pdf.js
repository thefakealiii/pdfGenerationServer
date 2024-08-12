import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';
import wkhtmltopdf from 'wkhtmltopdf';

export default async (req, res) => {
  try {
    const htmlContent = await req.body;
    console.log('Received HTML Content:', htmlContent);

    const pdfPath = path.join('/tmp', 'report.pdf');

    // Execute wkhtmltopdf with the HTML content
    await new Promise((resolve, reject) => {
      exec(`${wkhtmltopdf.path} --page-size A4 - ${pdfPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error generating PDF:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Read the generated PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Clean up the temporary PDF file
    fs.unlinkSync(pdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
};
