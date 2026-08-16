import { createWorker } from 'tesseract.js';

/**
 * OCR to recognize text from an image directly in the browser.
 */
export async function performClientOCR(imageSource: string): Promise<string> {
  // Use 'eng' and 'ben' for Bengali support
  const worker = await createWorker(['eng', 'ben']);
  try {
    const { data: { text } } = await worker.recognize(imageSource);
    console.log("Client-side OCR raw result:", text);
    return text;
  } catch (err) {
    console.error("Client-side Tesseract error:", err);
    throw new Error("OCR processing failed");
  } finally {
    await worker.terminate();
  }
}
