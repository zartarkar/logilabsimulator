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

          const prompt = `Analyze this image of a Boolean expression or a digital logic circuit. 
          
If it's a Boolean expression written in text (like A' + B + C or similar):
1. Identify all variables and operators.
2. Note that a line above a term (overline) or an apostrophe (') signifies NOT.
3. Return the expression in a standard format using AND, OR, NOT, XOR, NAND, NOR, XNOR or symbols like +, ., ', !.
4. Output should start with "F = ".

If it's a logic circuit diagram:
1. Identify the input variables (usually on the left).
2. Trace the gates from inputs to the final output.
3. Determine the Boolean expression that represents the entire circuit.
4. Output should start with "F = ".

Return ONLY the Boolean expression string, for example: "F = (A' + B + C)(A' + B')". 
Do not include any other text, explanations, or markdown formatting.`;

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
      let cleaned = ocrText.replace(/[^\w\s'+.()!]/g, '').trim();
      
      // Try to find something that looks like an assignment or just variables
      if (cleaned.length < 2) {
        return {
          success: false,
          error: "Could not detect a clear expression in the image. Please try typing it manually."
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
