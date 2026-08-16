import { createWorker } from 'tesseract.js';

/**
 * OCR fallback to recognize text from an image.
 */
export async function performOCR(base64Image: string): Promise<string> {
  const worker = await createWorker(['eng', 'ben']);
  try {
    const { data: { text } } = await worker.recognize(`data:image/png;base64,${base64Image}`);
    return text;
  } finally {
    await worker.terminate();
  }
}
