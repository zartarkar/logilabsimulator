import { createWorker } from 'tesseract.js';

/**
 * OCR fallback to recognize text from an image.
 */
export async function performOCR(base64Image: string): Promise<string> {
  const worker = await createWorker(['eng', 'ben']);
  try {
    // Tesseract can handle raw base64 or data URLs. 
    // We'll strip the prefix if it exists to be safe, though Tesseract is usually flexible.
    const imageSource = base64Image.includes('base64,') 
      ? base64Image 
      : `data:image/png;base64,${base64Image}`;
      
    const { data: { text } } = await worker.recognize(imageSource);
    console.log("OCR raw result:", text);
    return text;
  } catch (err) {
    console.error("Tesseract error:", err);
    throw new Error("OCR processing failed");
  } finally {
    await worker.terminate();
  }
}
