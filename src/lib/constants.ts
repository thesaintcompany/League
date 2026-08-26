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
