import { ALLERGEN_MAP } from '../data/allergenMap';

export interface EvaluationResult {
    safe: boolean;
    triggers: string[];
    reason: string;
}

export const evaluateProduct = (
    ingredients: string[] | undefined,
    userProfile: string[]
): EvaluationResult => {
    if (!ingredients || ingredients.length === 0) {
        return {
            safe: true, // Default safe if no ingredients (or unknown, handle UX separately)
            triggers: [],
            reason: "No ingredients data available.",
        };
    }

    const triggers: Set<string> = new Set();
    const reasons: string[] = [];

    // Normalize ingredients
    const normalizedIngredients = ingredients.map(i => i.toLowerCase().trim());

    userProfile.forEach(allergen => {
        const synonyms = ALLERGEN_MAP[allergen];

        if (synonyms) {
            synonyms.forEach(synonym => {
                const normalizedSynonym = synonym.toLowerCase();
                const found = normalizedIngredients.find(ing => ing.includes(normalizedSynonym));
                if (found) {
                    triggers.add(allergen);
                    reasons.push(`${found} (matches ${allergen})`);
                }
            });
        } else {
            // Fallback for custom allergens
            const normalizedAllergen = allergen.toLowerCase();
            const found = normalizedIngredients.find(ing => ing.includes(normalizedAllergen));
            if (found) {
                triggers.add(allergen);
                reasons.push(`${found} (matches ${allergen})`);
            }
        }
    });

    if (triggers.size > 0) {
        return {
            safe: false,
            triggers: Array.from(triggers),
            reason: `Contains: ${reasons.join(', ')}`,
        };
    }

    return {
        safe: true,
        triggers: [],
        reason: "No allergens found in ingredients.",
    };
};

// Helper to parse string ingredients (OpenFoodFacts sometimes returns string)
export const parseIngredientsText = (text: string): string[] => {
    if (!text) return [];
    // basic split by comma, brackets may need regex in future
    return text.split(',').map(s => s.trim().replace(/[()]/g, ''));
};
