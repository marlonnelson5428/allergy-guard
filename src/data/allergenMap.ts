// Comprehensive allergen map with synonyms in EN, FR, DE, ES, NL
// and scientific names where relevant.
export const ALLERGEN_MAP: Record<string, string[]> = {
    soy: [
        // English
        "soy", "soybean", "soy protein", "soy lecithin", "edamame", "miso", "natto", "shoyu", "tamari", "tempeh", "tofu", "yuba",
        // Scientific / Additives
        "glycine max", "e322",
        // French
        "soja", "fève de soja", "lecithine de soja",
        // German
        "soja", "sojabohne", "sojalezithin",
        // Spanish
        "soja", "soya", "lecifina de soja",
        // Dutch
        "soja", "sojaboon", "sojalechitine"
    ],
    peanut: [
        // English
        "peanut", "groundnut", "goober", "monkey nut", "peanut butter", "peanut oil",
        // Scientific
        "arachis hypogaea",
        // French
        "arachide", "cacahuète", "cacajuète", "pistache de terre",
        // German
        "erdnuss", "erdnüsse",
        // Spanish
        "cacahuete", "cacahuate", "maní",
        // Dutch
        "pinda", "aardnoot", "apennoot"
    ],
    milk: [
        // English
        "milk", "dairy", "butter", "cheese", "yogurt", "cream", "whey", "casein", "casienate", "lactose", "ghee", "curd", "buttermilk", "custard", "nougat", "paneer",
        // Scientific
        "bos taurus",
        // French
        "lait", "laitier", "beurre", "fromage", "crème", "lactosérum", "caséine", "yaourt",
        // German
        "milch", "butter", "käse", "sahne", "rahm", "molke", "kasein", "joghurt",
        // Spanish
        "leche", "mantequilla", "queso", "crema", "suero", "caseína", "yogur",
        // Dutch
        "melk", "zuivel", "boter", "kaas", "room", "wei", "caseïne", "lactose", "yoghurt"
    ],
    gluten: [
        // English
        "gluten", "wheat", "barley", "rye", "oats", "malt", "brewer's yeast", "spelt", "kamut", "durum", "semolina", "farina", "bulgur", "couscous", "seitan", "triticale", "bran", "germ", "farro", "einkorn", "emmer",
        // Scientific
        "triticum",
        // French
        "gluten", "blé", "orge", "seigle", "avoine", "malt", "épeautre", "kamut",
        // German
        "gluten", "weizen", "gerste", "roggen", "hafer", "malz", "dinkel",
        // Spanish
        "gluten", "trigo", "cebada", "centeno", "avena", "malta", "espelta",
        // Dutch
        "gluten", "tarwe", "gerst", "rogge", "haver", "mout", "spelt"
    ],
    egg: [
        // English
        "egg", "egg white", "egg yolk", "albumin", "globulin", "livetin", "ovalbumin", "ovomucin", "ovomucoid", "ovovitellin", "lysozyme", "mayonnaise", "meringue", "surimi",
        // Scientific
        "gallus gallus",
        // French
        "œuf", "oeuf", "albumine", "blanc d'œuf", "jaune d'œuf",
        // German
        "ei", "eier", "eiklar", "eigelb",
        // Spanish
        "huevo", "albúmina", "clara", "yema",
        // Dutch
        "ei", "eieren", "eiwit", "eigeel", "albumine"
    ],
    fish: [
        // English
        "fish", "anchovy", "bass", "catfish", "cod", "flounder", "grouper", "haddock", "hake", "halibut", "herring", "mahi mahi", "mackerel", "perch", "pike", "pollock", "salmon", "scrod", "sole", "snapper", "swordfish", "tilapia", "trout", "tuna", "sardine",
        // French
        "poisson", "anchois", "cabillaud", "saumon", "thon", "truite",
        // German
        "fisch", "lachs", "thunfisch", "forelle",
        // Spanish
        "pescado", "atún", "salmón", "trucha", "bacalao",
        // Dutch
        "vis", "zalm", "tonijn", "kabeljauw", "forel", "haring"
    ],
    shellfish: [
        // English
        "shellfish", "crustacean", "mollusk", "crab", "lobster", "shrimp", "prawn", "crayfish", "krill", "clam", "mussel", "oyster", "scallop", "squid", "octopus", "calamari", "snail", "escargot", "cockle", "whelk",
        // French
        "crustacé", "mollusque", "fruit de mer", "crabe", "homard", "crevette", "moule", "huitre", "calamar",
        // German
        "schalentiere", "krustentiere", "weichtiere", "krebs", "hummer", "garnele", "muschel", "auster", "tintenfisch",
        // Spanish
        "marisco", "crustáceo", "molusco", "cangrejo", "langosta", "gamba", "camarón", "mejillón", "ostra", "calamar",
        // Dutch
        "schaaldieren", "weekdieren", "kreeft", "krab", "garnaal", "mossel", "oester", "inktvis", "slak"
    ],
    tree_nut: [
        // English
        "nut", "almond", "brazil nut", "cashew", "chestnut", "coconut", "filbert", "hazelnut", "hickory", "macadamia", "pecan", "pine nut", "pistachio", "walnut", "praline",
        // French
        "fruit à coque", "noix", "amande", "noisette", "pistache", "noix de cajou", "noix de pécan", "noix de coco",
        // German
        "schalenfrucht", "nuss", "nüsse", "mandel", "haselnuss", "walnuss", "kaschu", "pistazie", "kokosnuss",
        // Spanish
        "fruto de cáscara", "nuez", "almendra", "avellana", "pistacho", "anacardo", "coco",
        // Dutch
        "noot", "noten", "amandel", "hazelnoot", "walnoot", "cashew", "pistache", "kokosnoot"
    ],
    sesame: [
        // English
        "sesame", "tahini", "halvah", "gingelly", "til", "benniseed",
        // Scientific
        "sesamum indicum",
        // French
        "sésame",
        // German
        "sesam",
        // Spanish
        "sésamo", "ajonjolí",
        // Dutch
        "sesam", "tahini"
    ]
};

export const CORE_ALLERGENS = Object.keys(ALLERGEN_MAP);
