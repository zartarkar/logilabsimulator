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
      const { google } = await import("@ai-sdk/google");

      const apiKey = process.env['GOOGLE_GENERATIVE_AI_API_KEY'];
      if (!apiKey) {
        return { success: false, error: "AI service not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to secrets." };
      }

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
        model: google("gemini-1.5-flash"),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image",
                image: data.base64Image,
              },
            ],
          },
        ],
      });

      // Clean up the response just in case
      let expression = text.trim();
      if (expression.startsWith("```")) {
        expression = expression.replace(/```[a-z]*\n?|```/g, "").trim();
      }

      return {
        success: true,
        expression: expression,
        explanation: "Extracted from image analysis using AI."
      };
    } catch (error) {
      console.error("Circuit recognition error:", error);
      return { success: false, error: "Failed to process image. Please ensure the expression is clear." };
    }
  });
