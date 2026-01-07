import { GoogleGenerativeAI } from "@google/generative-ai";


// You can get a key at https://aistudio.google.com/app/apikey and paste it below.
export const GEMINI_API_KEY: string = "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface AlternativeProduct {
    name: string;
    reason: string;
}

export async function getAlternativeRecommendations(
    productName: string,
    unsafeIngredients: string[],
    userAllergens: string[]
): Promise<AlternativeProduct[]> {


    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
        console.warn("Gemini API Key is missing.");
        return [
            { name: "API Key Missing", reason: "Please add your Gemini API key in src/services/RecommendationService.ts to see recommendations." }
        ];
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a helpful product safety assistant.
    The user has a product: "${productName}" which is unsafe because it contains: ${unsafeIngredients.join(", ")}.
    The user is allergic to: ${userAllergens.join(", ")}.
    
    Please suggest 2 specific alternative products that are similar to "${productName}" but do NOT contain any of the user's allergens.
    verify that the alternatives are commonly available real products.
    
    Output ONLY valid JSON in the following format:
    [
      { "name": "Alternative Product Name", "reason": "Why it is a good safe alternative" },
      ...
    ]
    Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if the model includes it despite instructions
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const alternatives: AlternativeProduct[] = JSON.parse(text);
        return alternatives.slice(0, 2);
    } catch (error) {
        console.error("Error fetching recommendations from Gemini:", error);
        return [];
    }
}
