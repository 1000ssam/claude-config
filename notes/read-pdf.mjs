import fs from 'fs';
import { PDFParse } from 'pdf-parse';

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('Usage: node read-pdf.mjs <pdf-path>');
  process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);
const parser = new PDFParse({ data: dataBuffer });
const result = await parser.getText();
console.log('=== PDF INFO ===');
console.log('Pages:', result.pages?.length ?? result.total ?? 'unknown');
console.log('=== TEXT ===');
console.log(result.text);
await parser.destroy?.();
