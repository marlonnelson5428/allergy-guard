export const ALLERGEN_MAP: Record<string, string[]> = {
    soy: ["e322", "lecithin", "soja", "glycine max", "soy protein", "soybean", "edamame", "miso", "natto", "shoyu", "tamari", "tempeh", "tofu"],
    peanut: ["arachis", "groundnut", "peanut butter", "valencia peanut", "goober", "monkey nut"],
    milk: ["milk", "lactose", "casein", "whey", "dairy", "cream", "butter", "cheese", "yogurt", "ghee", "curd", "buttermilk"],
    gluten: ["wheat", "barley", "rye", "oats", "malt", "brewer's yeast", "triticale", "spelt", "kamut", "farina", "semolina", "durum", "bulgur", "couscous", "seitan", "gluten"],
    egg: ["egg", "albumin", "globulin", "livetin", "ovalbumin", "ovomucin", "ovomucoid", "ovovitellin", "lysozyme", "surimi", "mayonnaise", "meringue"],
    fish: ["fish", "anchovy", "bass", "catfish", "cod", "flounder", "grouper", "haddock", "hake", "halibut", "herring", "mahi mahi", "mackerel", "perch", "pike", "pollock", "salmon", "scrod", "sole", "snapper", "swordfish", "tilapia", "trout", "tuna"],
    shellfish: ["shellfish", "crustacean", "mollusk", "barnacle", "crab", "crawfish", "crawdad", "crayfish", "krill", "lobster", "prawn", "shrimp", "clam", "cockle", "cuttlefish", "mussel", "octopus", "oyster", "scallop", "sea cucumber", "sea urchin", "snail", "squid", "whelk"],
    tree_nut: ["almond", "beechnut", "brazil nut", "butternut", "cashew", "chestnut", "chinquapin", "coconut", "filbert", "hazelnut", "hickory nut", "lichee nut", "macadamia nut", "nangai nut", "pecan", "pine nut", "pistachio", "shea nut", "walnut"],
    sesame: ["sesame", "benne", "benne seed", "benniseed", "gingelly", "gingelly oil", "gomasio", "halvah", "sesamol", "sesamomum indicum", "sesemolina", "sim sim", "tahini", "tahina", "tehina", "til"],
};

export const CORE_ALLERGENS = Object.keys(ALLERGEN_MAP);
