import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Recognizes a Boolean expression or circuit description from an image using AI.
 */
export const recognizeCircuitFromImage = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ base64Image: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { generateText } = await import("ai");
      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      const { performOCR } = await import("./circuit-recognition.server");

      const apiKey = process.env['GOOGLE_GENERATIVE_AI_API_KEY'];
      
      // Try AI recognition first if API key is present
      if (apiKey && apiKey.trim().length > 0) {
        try {
          const google = createGoogleGenerativeAI({ apiKey });
          const model = google("gemini-1.5-flash-latest"); // Try latest first for better compatibility

          const prompt = `Analyze this image of a digital logic circuit or a Boolean expression.

If it's a logic circuit diagram:
1. Identify all gates (AND, OR, NOT, NAND, NOR, XOR, XNOR).
2. Identify all input variables (e.g., A, B, C) and where they connect.
3. Identify all intermediate connections and the final output.
4. Convert this circuit into its canonical Boolean expression.
5. Note: A bubble/circle at the input or output of a gate signifies inversion (NOT).
6. Return the result in the format "F = <expression>".

If it's a handwritten or printed Boolean expression:
1. Identify all variables and operators.
2. An overline (line above) or an apostrophe (') signifies NOT.
3. Return the expression in the format "F = <expression>".

Return ONLY the "F = ..." string. No explanations. Example: "F = (A + B) . C'" or "F = A'B + AB'".`;

          const { text } = await generateText({
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image",
                    image: Buffer.from(data.base64Image, 'base64'),
                  },
                ],
              },
            ],
          });

          let expression = text.trim();
          if (expression.startsWith("```")) {
            expression = expression.replace(/```[a-z]*\n?|```/g, "").trim();
          }

          if (expression && expression.length > 0) {
            if (!expression.includes('=') && !expression.includes('F')) {
               expression = "F = " + expression;
            }
            return {
              success: true,
              expression: expression,
              explanation: "Extracted from image analysis using AI."
            };
          }
        } catch (aiError: any) {
          console.error("AI Recognition failed, falling back to OCR:", aiError);
          // Fall through to OCR
        }
      }

      // Fallback to OCR if AI fails or no API key
      const ocrText = await performOCR(data.base64Image);
      
      // Simple heuristic to extract something that looks like an expression
      // Improved heuristic to extract Boolean expressions
      let cleaned = ocrText
        .replace(/\n/g, ' ')
        .replace(/[^\w\s'+.()!]/g, '')
        .trim();
      
      // Try to find a substring that looks like an expression (at least one variable and an operator or group)
      const likelyExpression = cleaned.match(/[A-Z]\s*['+.*]\s*[A-Z]|[A-Z]['+]|[A-Z]\./i);
      
      if (cleaned.length < 2 && !likelyExpression) {
        return {
          success: false,
          error: "Could not detect a clear expression in the image. Please try typing it manually or ensure the image is high-contrast."
        };
      }

      if (!cleaned.includes('=') && !cleaned.includes('F')) {
        cleaned = "F = " + cleaned;
      }

      return {
        success: true,
        expression: cleaned,
        explanation: "Extracted using OCR (AI was unavailable or failed)."
      };

    } catch (error: any) {
      console.error("Circuit recognition error:", error);
      const errorMessage = error?.message || "";
      
      if (errorMessage.includes("Model") && errorMessage.includes("not found")) {
        return {
          success: false,
          error: "The AI model is temporarily unavailable. Please try again in a few moments or use a clearer image for OCR fallback."
        };
      }

      if (errorMessage.includes("API key")) {
        return {
          success: false,
          error: "GOOGLE_GENERATIVE_AI_API_KEY is missing or invalid. Please add it to project secrets."
        };
      }

      return { 
        success: false, 
        error: "Failed to process image. Please ensure the expression is clear and well-lit." 
      };
    }
  });
