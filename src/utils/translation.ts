export const fetchSynonyms = async (text: string): Promise<string[]> => {
    // English is the source, verify user input is not empty
    if (!text.trim()) return [];

    const languages = [
        "fr", // French
        "de", // German
        "es", // Spanish
        "nl"  // Dutch
    ];

    const synonyms: Set<string> = new Set();
    synonyms.add(text.toLowerCase()); // Add the original term

    try {
        const promises = languages.map(async (lang) => {
            // Using MyMemory API (Free tier)
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
            const response = await fetch(url);
            const json = await response.json();

            if (json.responseStatus === 200 && json.responseData?.translatedText) {
                return json.responseData.translatedText.toLowerCase();
            }
            return null;
        });

        const results = await Promise.all(promises);

        results.forEach(res => {
            if (res) synonyms.add(res);
        });

    } catch (error) {
        console.error("Translation API error:", error);
        // Fail silently, we still have the original term
    }

    return Array.from(synonyms);
};
