import { evaluateProduct } from '../utils/safetyEngine';
import { fetchSynonyms } from '../utils/translation';

console.log("Running Comprehensive Safety Test Suite...\n");

const runTests = async () => {
    let passed = 0;
    let total = 0;

    const assert = (name: string, condition: boolean) => {
        total++;
        if (condition) {
            console.log(`[PASS] ${name}`);
            passed++;
        } else {
            console.log(`[FAIL] ${name}`);
        }
    };

    // --- TEST 1: SAFE vs UNSAFE (Basic) ---
    const t1 = evaluateProduct(["sugar", "salt"], ["peanut"]);
    assert("Returns Safe for harmless ingredients", t1.status === 'safe' && t1.safe === true);

    const t2 = evaluateProduct(["sugar", "peanut butter"], ["peanut"]);
    assert("Returns Unsafe for exact allergen match", t2.status === 'unsafe' && t2.safe === false && t2.triggers.includes("peanut"));

    // --- TEST 2: UNKNOWN Status ---
    const t3 = evaluateProduct([], ["peanut"]);
    assert("Returns Unknown for empty ingredients (array)", t3.status === 'unknown');

    const t4 = evaluateProduct(undefined, ["peanut"]);
    assert("Returns Unknown for undefined ingredients", t4.status === 'unknown');

    // --- TEST 3: Multi-Language (Built-in) ---
    // "Milk" in French is "Lait"
    const t5 = evaluateProduct(["sucre", "poudre de lait"], ["milk"]);
    assert("Detects 'Lait' as Milk (French)", t5.status === 'unsafe' && t5.triggers.includes("milk"));

    // --- TEST 4: Custom Allergen Translation ---
    console.log("... Testing Translation API (Simulating 'Strawberry' input) ...");

    // 1. Verify API fetches synonyms
    const synonyms = await fetchSynonyms("strawberry");
    assert("Fetches synonyms for 'strawberry'", synonyms.length > 1 && synonyms.includes("fraise"));

    // 2. Verify Safety Engine uses them
    // Simulate user added "strawberry" with fetched synonyms
    const customSynonyms = { "strawberry": synonyms };
    const t6 = evaluateProduct(["sucre", "confiture de fraise"], ["strawberry"], customSynonyms);

    assert("Detects custom translated allergen (Fraise -> Strawberry)",
        t6.status === 'unsafe' && t6.triggers.includes("strawberry"));

    // --- SUMMARY ---
    console.log(`\nTests Completed: ${passed}/${total} passed.`);
};

runTests();
