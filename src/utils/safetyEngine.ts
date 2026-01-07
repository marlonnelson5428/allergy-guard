import { ALLERGEN_MAP } from '../data/allergenMap';

export interface EvaluationResult {
    safe: boolean;
    status: 'safe' | 'unsafe' | 'unknown';
    triggers: string[];
    reason: string;
}

export const evaluateProduct = (
    ingredients: string[] | undefined,
    userProfile: string[],
    customSynonyms: Record<string, string[]> = {}
): EvaluationResult => {
    if (!ingredients || ingredients.length === 0) {
        return {
            safe: false, // Not strictly safe
            status: 'unknown',
            triggers: [],
            reason: "Ingredients list is missing or empty. Cannot verify safety.",
        };
    }

    const triggers: Set<string> = new Set();
    const reasons: string[] = [];

    // Join ingredients into one searchable text block for context, 
    // but we can also match against individual items if ingredients is already an array.
    // Normalized text helps with accent matching (e.g. "café" -> "cafe")
    const fullText = normalizeText(ingredients.join(' '));

    for (const allergen of userProfile) {
        // Get known synonyms from ALLERGEN_MAP, or custom synonyms, or default to the allergen name itself
        const synonyms = ALLERGEN_MAP[allergen]
            || customSynonyms[allergen]
            || [allergen];

        for (const synonym of synonyms) {
            // Create a regex to match the synonym as a whole word
            // \b matches word boundaries
            // We escape special regex characters in the synonym just in case
            const escapedSynonym = escapeRegExp(synonym);
            // Dynamic regex: searches for whole word, case insensitive
            const regex = new RegExp(`\\b${escapedSynonym}\\b`, 'i');

            // Check normalized text against normalized synonym
            const normalizedSynonym = normalizeText(synonym);
            // We need to match normalized synonym in normalized full text
            const normalizedRegex = new RegExp(`\\b${escapeRegExp(normalizedSynonym)}\\b`, 'i');

            if (normalizedRegex.test(fullText)) {
                triggers.add(allergen);
                // Try to find the actual matching text in original ingredients for display
                // This is a bit trickier, but showing the synonym found is good enough
                reasons.push(`${synonym} (matches ${allergen})`);
                break; // Found this allergen, no need to check other synonyms for it
            }
        }
    }

    if (triggers.size > 0) {
        return {
            safe: false,
            status: 'unsafe',
            triggers: Array.from(triggers),
            reason: `Contains: ${Array.from(new Set(reasons)).join(', ')}`,
        };
    }

    return {
        safe: true,
        status: 'safe',
        triggers: [],
        reason: "No allergens found in ingredients.",
    };
};

const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD") // Decompose accents
        .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
};

const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to parse string ingredients (OpenFoodFacts sometimes returns string)
export const parseIngredientsText = (text: string): string[] => {
    if (!text) return [];
    // basic split by comma, brackets may need regex in future
    return text.split(',').map(s => s.trim().replace(/[()]/g, ''));
};
