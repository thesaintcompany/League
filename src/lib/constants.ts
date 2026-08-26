export const SPORTS = [
  "Fotbal",
  "Tenis",
  "Tenis de Masă",
  "Padel",
  "Baschet",
  "Handbal",
  "Volei",
  "Hochei",
  "Rugby",
  "Custom",
] as const;

export function isIndividualSport(sport?: string | null): boolean {
  if (!sport) return false;
  const s = sport.toLowerCase();
  return (
    s.includes("tenis") ||
    s.includes("padel") ||
    s.includes("badminton") ||
    s.includes("squash")
  );
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
  { value: "simplu_masculin", label: "🎾 Simplu Masculin (Singles Men)" },
  { value: "simplu_feminin", label: "🎾 Simplu Feminin (Singles Women)" },
  { value: "dublu_masculin", label: "👥 Dublu Masculin (Doubles Men)" },
  { value: "dublu_feminin", label: "👥 Dublu Feminin (Doubles Women)" },
  { value: "dublu_mixt", label: "✨ Dublu Mixt (Mixed Doubles)" },
  { value: "juniori_tenis", label: "🌟 Juniori & Kids (U12, U14, U16)" },
] as const;

export const TENNIS_SURFACES = [
  { value: "Zgură (Clay)", label: "🔴 Zgură (Clay • Roland Garros style)" },
  { value: "Hard (Ciment)", label: "🔵 Hard / Ciment (US Open / Australian Open style)" },
  { value: "Iarbă (Grass)", label: "🟢 Iarbă (Grass • Wimbledon style)" },
  { value: "Sintetic Indoor", label: "🟡 Sintetic Indoor / Sală" },
] as const;

export const TENNIS_SETS_RULES = [
  { value: "best_of_3", label: "Cel mai bun din 3 Seturi (2 seturi câștigate)" },
  { value: "best_of_3_super_tb", label: "2 Seturi normale + Super Tiebreak la 10 în decisiv" },
  { value: "pro_set_9", label: "Pro-Set (primul la 9 game-uri)" },
  { value: "best_of_5", label: "Cel mai bun din 5 Seturi (Grand Slam)" },
] as const;

export const CHAMPIONSHIP_SCOPES = [
  { value: "national", label: "🇷🇴 Național (Toată România - Toate Județele)" },
  { value: "judetean", label: "🏛️ Județean (Județ Specific)" },
  { value: "oras", label: "🏙️ Local / Municipal (Oraș Specific)" },
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

// Harta linkurilor oficiale AJF (Asociația Județeană de Fotbal) / Comisia Județeană de Arbitri (CJA)
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
