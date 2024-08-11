const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chromium = require('chromium');

const app = express();
const port = 3005;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '100mb' })); // Adjust the limit as needed

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.myvehiclereports.com'
];

// Configure CORS with multiple origins
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      // Allow requests with no origin (like mobile apps or curl requests)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

// Handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.send();
});

// Route to generate the PDF
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromium.path,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add necessary arguments
    });

    const htmlContent = req.body.html; // Get HTML content from the request
    console.log("Received HTML Content:", htmlContent); // Log the received HTML for debugging

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=report.pdf',
    });
    res.send(pdfBuffer); // Send the PDF buffer to the client
  } catch (err) {
    console.error("Error generating PDF:", err); // Log the error to the console
    res.status(500).send('Error generating PDF');
  }
});


app.get('/home', async (req, res) => {

  console.log("Server is working");

});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
