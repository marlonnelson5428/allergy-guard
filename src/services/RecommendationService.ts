import { GoogleGenerativeAI } from "@google/generative-ai";
import { evaluateProduct } from "../utils/safetyEngine";

// ===== Gemini setup =====
export const GEMINI_API_KEY: string = "AIzaSyDqZ1Px6W17m8O-vbZQaLVrateFf9e1r_Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ===== Image imports (local assets) =====
import GlutenFreeBreadImg from "../images/glutenfree.jpg";

import PotatoChipsImg from "../images/potatochips.jpg";

import SoySauceImg from "../images/soysauce.jpg";

import PlaceholderImg from "../images/sorry.jpg";

// ===== Types =====
export interface AlternativeProduct {
  name: string;
  reason: string;
  image: any; // Expo ImageSource
}

type ProductCategory = "bread" | "chips" | "pasta" | "null" | "soy";

// ===== Product catalog (prototype-scale, deterministic) =====
const PRODUCT_CATALOG = [
  {
    name: "Gluten-Free Bread",
    category: "bread" as ProductCategory,
    ingredients: ["rice flour", "water"],
    image: GlutenFreeBreadImg,
  },
//   {
//     name: "Wheat Pasta",
//     category: "pasta" as ProductCategory,
//     ingredients: ["wheat flour", "water"],
//     image: WheatPastaImg,
//   },
  {
    name: "Potato Chips",
    category: "chips" as ProductCategory,
    ingredients: ["potato", "salt"],
    image: PotatoChipsImg,
  },
//   {
//     name: "Unknown Product",
//     category: "null" as ProductCategory,
//     ingredients: [],
//     image: PlaceholderImg,
//   },
  {
    name: "Soy sauce",
    category: "soy" as ProductCategory,
    ingredients: ["water" , "soy"],
    image: SoySauceImg,
  },

];

// ===== Category inference (rule-based, no AI) =====
function inferCategory(productName: string): ProductCategory {
  const name = productName.toLowerCase();

  if (
    name.includes("bread") ||
    name.includes("brood") ||
    name.includes("whole wheat") ||
    name.includes("wholemeal") ||
    name.includes("loaf")
  ) {
    return "bread";
  }

  if (
    name.includes("chips") ||
    name.includes("crisps") ||
    name.includes("tortilla")
  ) {
    return "chips";
  }

  if (
    name.includes("pasta") ||
    name.includes("spaghetti") ||
    name.includes("penne")
  ) {
    return "pasta";
  }
  if (
    name.includes("ketjap") ||
    name.includes("manis") ||
    name.includes("sauce")
  ) {
    return "soy";
  }

  return "null";
}

// ===== Main recommendation function =====
export async function getAlternativeRecommendations(
  productName: string,
  unsafeIngredients: string[],
  userAllergens: string[]
): Promise<AlternativeProduct[]> {

  // 1️⃣ Determine category
  const scannedCategory = inferCategory(productName);

  // 2️⃣ Filter catalog by category
  const categoryCandidates = PRODUCT_CATALOG.filter(
    p => p.category === scannedCategory
  );

  // 3️⃣ Filter safe alternatives using YOUR safety engine
  const safeAlternatives = categoryCandidates
    .filter(p => {
      const result = evaluateProduct(p.ingredients, userAllergens);
      return result.safe;
    })
    .slice(0, 2);

  // 4️⃣ Edge case: no safe alternatives
  if (safeAlternatives.length === 0) {
    return [
      {
        name: "No Safe Alternatives",
        reason: "No safe alternatives were found in the current product catalog.",
        image: PlaceholderImg,
      },
    ];
  }

  // 5️⃣ AI explains (does NOT choose)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a product safety assistant.

The user scanned "${productName}" which is unsafe for their allergies.

The following products have already been verified as safe alternatives:
${JSON.stringify(
  safeAlternatives.map(p => ({ name: p.name, ingredients: p.ingredients })),
  null,
  2
)}

Explain briefly why EACH product is a good alternative.

Output ONLY valid JSON in the following format:
[
  { "name": "Product Name", "reason": "Explanation" }
]

Do not include markdown or extra text.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const aiResults: { name: string; reason: string }[] = JSON.parse(text);

    // 6️⃣ Merge AI explanation with catalog images
    return aiResults.map(result => {
      const product = safeAlternatives.find(p => p.name === result.name);

      return {
        name: result.name,
        reason: result.reason,
        image: product?.image ?? PlaceholderImg,
      };
    });

  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    return [];
  }
}
