export const SPORTS = [
  "Fotbal",
  "Baschet",
  "Handbal",
  "Volei",
  "Hochei",
  "Rugby",
  "Custom",
] as const;

export const FORMATS = [
  { value: "round_robin", label: "Round-robin (toți cu toți)" },
  { value: "knockout", label: "Knockout (eliminare directă)" },
  { value: "groups_knockout", label: "Grupe + knockout" },
] as const;
