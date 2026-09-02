export const SPORTS = [
  "Fotbal",
  "Futsal",
  "Baschet",
  "Handbal",
  "Volei",
  "Hochei",
  "Rugby",
  "Custom",
] as const;

export interface ArenaSportOption {
  id: string;
  label: string;
  shortName: string;
  icon: string;
}

export const ARENA_SPORTS_OPTIONS: ArenaSportOption[] = [
  { id: "fotbal", label: "Fotbal & Minifotbal", shortName: "Fotbal", icon: "sports_soccer" },
  { id: "futsal", label: "Futsal & Sală", shortName: "Futsal", icon: "sports_soccer" },
  { id: "tenis", label: "Tenis de Câmp", shortName: "Tenis", icon: "sports_tennis" },
  { id: "padel", label: "Padel", shortName: "Padel", icon: "sports_tennis" },
  { id: "pingpong", label: "Tenis de Masă (Ping-Pong)", shortName: "Ping-Pong", icon: "circle" },
  { id: "baschet", label: "Baschet 5x5 & 3x3", shortName: "Baschet", icon: "sports_basketball" },
  { id: "volei", label: "Volei / Beach Volley", shortName: "Volei", icon: "sports_volleyball" },
  { id: "handbal", label: "Handbal Național", shortName: "Handbal", icon: "sports_handball" },
  { id: "multifunctional", label: "Multifuncțional / Mixt", shortName: "Multisport", icon: "stadium" },
];

export function parseVenueSports(val?: string | null): string[] {
  if (!val) return ["fotbal"];
  const list = val
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 ? list : ["fotbal"];
}

export function isIndividualSport(sport?: string | null): boolean {
  if (!sport) return false;
  const s = sport.toLowerCase();
  return (
    s.includes("tenis") ||
    s.includes("padel") ||
    s.includes("ping") ||
    s.includes("pong") ||
    s.includes("masă") ||
    s.includes("masa") ||
    s.includes("badminton") ||
    s.includes("squash")
  );
}

export function translateMatchStage(stage?: string | null): string {
  const labels: Record<string, string> = {
    group: "Faza grupelor",
    round_robin: "Etapă eliminatorie",
    quarter_final: "Sferturi de finală",
    semi_final: "Semifinală",
    final: "Finală",
  };

  return stage ? labels[stage] || stage : "Etapă Oficială";
}

export const FORMATS = [
  { value: "round_robin", label: "Round-robin (toți cu toți)" },
  { value: "knockout", label: "Knockout (eliminare directă)" },
  { value: "groups_knockout", label: "Grupe + knockout" },
] as const;

export const FOOTBALL_CATEGORIES = [
  { value: "masculin", label: "Masculin (Seniori • Fotbal 11v11)" },
  { value: "feminin", label: "Feminin (Fotbal Feminin)" },
  { value: "futsal", label: "Futsal & Minifotbal (Sală & Minifotbal)" },
  { value: "juniori", label: "Juniori & Tineret (U19, U17, U15, Academii)" },
] as const;

export const TENNIS_CATEGORIES = [
  { value: "simplu_masculin", label: "Simplu Masculin (Singles Men)" },
  { value: "simplu_feminin", label: "Simplu Feminin (Singles Women)" },
  { value: "dublu_masculin", label: "Dublu Masculin (Doubles Men)" },
  { value: "dublu_feminin", label: "Dublu Feminin (Doubles Women)" },
  { value: "dublu_mixt", label: "Dublu Mixt (Mixed Doubles)" },
  { value: "juniori_tenis", label: "Juniori & Kids (U12, U14, U16)" },
] as const;

export const PADEL_CATEGORIES = [
  { value: "padel_masculin", label: "Dublu Masculin" },
  { value: "padel_feminin", label: "Dublu Feminin" },
  { value: "padel_mixt", label: "Dublu Mixt" },
  { value: "padel_pro", label: "Nivel Pro / Avansați (Nivel 1-2)" },
  { value: "padel_amatori", label: "Nivel Amatori / Intermediari (Nivel 3-5)" },
  { value: "padel_open", label: "Open Padel (Toate Nivelurile)" },
] as const;

export const PINGPONG_CATEGORIES = [
  { value: "pingpong_simplu_masculin", label: "Simplu Masculin" },
  { value: "pingpong_simplu_feminin", label: "Simplu Feminin" },
  { value: "pingpong_dublu", label: "Dublu (Doubles)" },
  { value: "pingpong_open", label: "Open Amatori / Turneu Liber" },
  { value: "pingpong_elite", label: "Categoria Elită / Avansați" },
  { value: "pingpong_amatori", label: "Categoria Hobby / Amatori" },
] as const;

export const TENNIS_SURFACES = [
  { value: "Zgură (Clay)", label: "Zgură (Clay • Roland Garros style)" },
  { value: "Hard (Ciment)", label: "Hard / Ciment (US Open / Australian Open style)" },
  { value: "Iarbă (Grass)", label: "Iarbă (Grass • Wimbledon style)" },
  { value: "Sintetic Indoor", label: "Sintetic Indoor / Sală" },
  { value: "Sticlă Panoramică & Gazon Padel", label: "Teren Padel Panoramic cu Gazon Sintetic" },
  { value: "Suprafață ITTF Lemn / Sintetic", label: "Măsură Competițională Omologată ITTF" },
] as const;

export const TENNIS_SETS_RULES = [
  { value: "best_of_3", label: "Cel mai bun din 3 Seturi (2 seturi câștigate)" },
  { value: "best_of_3_super_tb", label: "2 Seturi normale + Super Tiebreak la 10 în decisiv" },
  { value: "best_of_5_pingpong", label: "Cel mai bun din 5 Seturi la 11 puncte (Ping-Pong)" },
  { value: "best_of_7_pingpong", label: "Cel mai bun din 7 Seturi la 11 puncte (Finală Ping-Pong)" },
  { value: "pro_set_9", label: "Pro-Set (primul la 9 game-uri)" },
  { value: "best_of_5", label: "Cel mai bun din 5 Seturi (Grand Slam)" },
] as const;

export const CHAMPIONSHIP_SCOPES = [
  { value: "national", label: "Național" },
  { value: "judetean", label: "Județean" },
  { value: "oras", label: "Local" },
] as const;

export const ROMANIAN_COUNTIES = [
  "Alba",
  "Arad",
  "Argeș",
  "Bacău",
  "Bihor",
  "Bistrița-Năsăud",
  "Botoșani",
  "Brașov",
  "Brăila",
  "București",
  "Buzău",
  "Caraș-Severin",
  "Călărași",
  "Cluj",
  "Constanța",
  "Covasna",
  "Dâmbovița",
  "Dolj",
  "Galați",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomița",
  "Iași",
  "Ilfov",
  "Maramureș",
  "Mehedinți",
  "Mureș",
  "Neamț",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiș",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
] as const;

// Harta linkurilor  e AJF (Asociația Județeană de Fotbal) / Comisia Județeană de Arbitri (CJA)
export const AJF_COUNTY_URLS: Record<string, string> = {
  "Alba": "https://www.frf-ajf.ro/alba",
  "Arad": "https://www.frf-ajf.ro/arad",
  "Argeș": "https://www.frf-ajf.ro/arges",
  "Bacău": "https://www.frf-ajf.ro/bacau",
  "Bihor": "https://www.frf-ajf.ro/bihor",
  "Bistrița-Năsăud": "https://www.frf-ajf.ro/bistrita-nasaud",
  "Botoșani": "https://www.frf-ajf.ro/botosani",
  "Brașov": "https://www.frf-ajf.ro/brasov",
  "Brăila": "https://www.frf-ajf.ro/braila",
  "București": "https://www.amfb.ro",
  "Buzău": "https://www.frf-ajf.ro/buzau",
  "Caraș-Severin": "https://www.frf-ajf.ro/caras-severin",
  "Călărași": "https://www.frf-ajf.ro/calarasi",
  "Cluj": "https://www.frf-ajf.ro/cluj",
  "Constanța": "https://www.frf-ajf.ro/constanta",
  "Covasna": "https://www.frf-ajf.ro/covasna",
  "Dâmbovița": "https://www.frf-ajf.ro/dambovita",
  "Dolj": "https://www.frf-ajf.ro/dolj",
  "Galați": "https://www.frf-ajf.ro/galati",
  "Giurgiu": "https://www.frf-ajf.ro/giurgiu",
  "Gorj": "https://www.frf-ajf.ro/gorj",
  "Harghita": "https://www.frf-ajf.ro/harghita",
  "Hunedoara": "https://www.frf-ajf.ro/hunedoara",
  "Ialomița": "https://www.frf-ajf.ro/ialomita",
  "Iași": "https://www.frf-ajf.ro/iasi",
  "Ilfov": "https://www.frf-ajf.ro/ilfov",
  "Maramureș": "https://www.frf-ajf.ro/maramures",
  "Mehedinți": "https://www.frf-ajf.ro/mehedinti",
  "Mureș": "https://www.frf-ajf.ro/mures",
  "Neamț": "https://www.frf-ajf.ro/neamt",
  "Olt": "https://www.frf-ajf.ro/olt",
  "Prahova": "https://www.frf-ajf.ro/prahova",
  "Satu Mare": "https://www.frf-ajf.ro/satu-mare",
  "Sălaj": "https://www.frf-ajf.ro/salaj",
  "Sibiu": "https://www.frf-ajf.ro/sibiu",
  "Suceava": "https://www.frf-ajf.ro/suceava",
  "Teleorman": "https://www.frf-ajf.ro/teleorman",
  "Timiș": "https://www.frf-ajf.ro/timis",
  "Tulcea": "https://www.frf-ajf.ro/tulcea",
  "Vaslui": "https://www.frf-ajf.ro/vaslui",
  "Vâlcea": "https://www.frf-ajf.ro/valcea",
  "Vrancea": "https://www.frf-ajf.ro/vrancea",
};

export function getAjfUrlForCounty(county?: string | null): { url: string; label: string } {
  if (!county || county.trim() === "" || county.toLowerCase() === "toate") {
    return {
      url: "https://www.frf.ro/comunicari/comisii-frf/comisia-centrala-a-arbitrilor/",
      label: "Comisia Centrală a Arbitrilor (FRF)",
    };
  }
  const cleanCounty = county.trim();
  // Normalize match
  const foundKey = Object.keys(AJF_COUNTY_URLS).find(
    (k) => k.toLowerCase() === cleanCounty.toLowerCase()
  );
  if (foundKey && AJF_COUNTY_URLS[foundKey]) {
    return {
      url: AJF_COUNTY_URLS[foundKey],
      label: foundKey === "București" ? "AMFB (București)" : `AJF ${foundKey}`,
    };
  }
  return {
    url: "https://www.frf.ro/comunicari/comisii-frf/comisia-centrala-a-arbitrilor/",
    label: "Comisia Centrală a Arbitrilor (FRF)",
  };
}

export function getSportsReadableString(val?: string | null): { single: boolean; text: string; rawList: string[] } {
  const sports = parseVenueSports(val);
  const cleanSports = sports.filter((s) => s !== "multifunctional");
  const listToUse = cleanSports.length > 0 ? cleanSports : ["fotbal"];

  const namesMap: Record<string, string> = {
    fotbal: "fotbal",
    futsal: "futsal",
    tenis: "tenis de câmp",
    padel: "padel",
    pingpong: "tenis de masă",
    baschet: "baschet",
    volei: "volei",
    handbal: "handbal",
    multifunctional: "multisport",
  };

  const labels = listToUse.map((s) => namesMap[s] || s);
  if (labels.length === 1) {
    return { single: true, text: labels[0], rawList: listToUse };
  }
  if (labels.length === 2) {
    return { single: false, text: `${labels[0]} și ${labels[1]}`, rawList: listToUse };
  }
  return {
    single: false,
    text: `${labels.slice(0, -1).join(", ")} și ${labels[labels.length - 1]}`,
    rawList: listToUse,
  };
}

export function getVenueSpecsTemplates(sportsVal?: string | null, surfaceVal?: string | null): string[] {
  const { single, text } = getSportsReadableString(sportsVal);
  const surface = surfaceVal ? surfaceVal.toLowerCase() : "sintetic";

  if (single) {
    return [
      `Teren oficial de ${text} cu gazon ${surface} de înaltă performanță, nocturnă omologată și vestiare moderne.`,
      `Teren de ${text} omologat competițional, dotat cu nocturnă LED, vestiare complete și spații tehnice.`,
      `Infrastructură sportivă dedicată meciurilor de ${text}, optimizată pentru campionate, turnee și antrenamente.`,
      `Teren de ${text} all-season cu nocturnă puternică, suprafață de joc întreținută profesional și acces facil.`,
      `Zonă sportivă modernă pentru meciuri de ${text}, prevăzută cu parcare generoasă, vestiare cu dușuri și nocturnă.`,
      `Bază sportivă de ${text} la standarde federale, cu suprafață ${surface}, bănci de rezerve acoperite și nocturnă.`,
      `Teren de ${text} dedicat pentru cluburi și comunitate, cu suprafață de top și vestiare individuale.`,
      `Arenă de ${text} cu nocturnă, suprafață de joc impecabilă, tribune pentru spectatori și parcare privată.`,
      `Teren modern de ${text} în aer liber, cu nocturnă automată și vestiare securizate.`,
      `Teren de ${text} amenajat la standarde europene, cu suprafață ${surface} certificată și nocturnă omologată.`,
    ];
  }

  return [
    `Complex sportiv multifuncțional: teren amenajat pentru ${text}, cu nocturnă omologată și vestiare moderne.`,
    `Teren multifuncțional dedicat pentru ${text}, cu suprafețe adaptabile și marcaje oficiale omologate.`,
    `Bază sportivă multifuncțională optimizată pentru meciuri de campionat, turnee și antrenamente de ${text}.`,
    `Complex multifuncțional all-season cu nocturnă pentru ${text}, disponibil pe tot parcursul anului.`,
    `Zonă sportivă multifuncțională pentru ${text}, prevăzută cu parcare generoasă, vestiare cu dușuri și nocturnă.`,
    `Infrastructură multifuncțională de performanță pentru ${text}, suprafețe de nivel înalt și nocturnă LED.`,
    `Centru sportiv multifuncțional dedicat pentru ${text}, cu facilități complete de pregătire și vestiare.`,
    `Arenă multifuncțională cu nocturnă, spații de joc pentru ${text}, tribune spectatori și parcare privată.`,
    `Bază sportivă urbană multifuncțională: terenuri special amenajate pentru ${text} și facilități moderne.`,
    `Infrastructură multifuncțională completă amenajată la standarde europene pentru ${text}, cu nocturnă omologată.`,
  ];
}

export function sanitizeVenueSpecs(
  specs?: string | null,
  sportsVal?: string | null,
  surfaceVal?: string | null
): string {
  const templates = getVenueSpecsTemplates(sportsVal, surfaceVal);
  if (!specs || specs.trim() === "") {
    return templates[0];
  }

  const { single, rawList } = getSportsReadableString(sportsVal);
  const sLower = specs.toLowerCase();

  // If only one sport is selected (or sports without baschet/handbal),
  // but specs explicitly has "teren multifuncțional baschet/handbal" or mentions unselected sports
  if (single) {
    const forbiddenSports = ["baschet", "handbal", "volei", "tenis", "padel", "pingpong", "rugby", "hochei"]
      .filter((sp) => !rawList.includes(sp));

    const containsForbidden = forbiddenSports.some((sp) => sLower.includes(sp));
    if (containsForbidden || sLower.includes("multifuncțional") || sLower.includes("multifunctional")) {
      return templates[0];
    }
  }

  return specs.trim();
}
