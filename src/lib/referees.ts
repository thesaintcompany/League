export interface RefereePhotoTarget {
  name?: string | null;
  coverPhotoUrl?: string | null;
  image?: string | null;
}

export const REFEREE_AUTHENTIC_UNIFORM_PHOTOS = [
  "/images/referees/referee-2.jpg", // Black Elite Referee with patch & whistle
  "/images/referees/referee-1.jpg", // Cyan Blue VAR Elite with headset & whistle
  "/images/referees/referee-5.jpg", // Neon Yellow Referee with Yellow Card
  "/images/referees/referee-4.jpg", // Neon Lime Referee with earpiece
  "/images/referees/referee-6.jpg", // Orange / Black Referee with Red Card
  "/images/referees/referee-3.jpg", // Female Referee in official uniform & whistle
];

export function getSafeRefereePhoto(
  ref: RefereePhotoTarget,
  idx: number = 0
): string {
  if (ref.coverPhotoUrl && ref.coverPhotoUrl.startsWith("/images/referees/")) {
    return ref.coverPhotoUrl;
  }
  if (ref.image && ref.image.startsWith("/images/referees/")) {
    return ref.image;
  }

  // Female referee detection by name
  const femaleNames = [
    "alina",
    "iuliana",
    "elena",
    "maria",
    "ana",
    "andreea",
    "mihaela",
    "diana",
    "roxana",
    "alexandra",
    "ioana",
    "peșu",
    "pesu",
    "demetrescu",
  ];
  const nameLower = (ref.name || "").toLowerCase();
  const isFemale = femaleNames.some((n) => nameLower.includes(n));
  if (isFemale) return "/images/referees/referee-3.jpg";

  const malePhotos = [
    "/images/referees/referee-2.jpg",
    "/images/referees/referee-1.jpg",
    "/images/referees/referee-5.jpg",
    "/images/referees/referee-4.jpg",
    "/images/referees/referee-6.jpg",
  ];
  return malePhotos[idx % malePhotos.length];
}

// Generate realistic referee officiating telemetry
export function getRefereeTelemetry(
  ref: { experienceYears?: number | null; refereeBadge?: string | null },
  idx: number = 0
) {
  const years = ref.experienceYears || 10;
  const isElite = Boolean(ref.refereeBadge?.includes(" ") || ref.refereeBadge?.includes("Elite"));
  const matchesCount = isElite ? Math.round(years * 14 + (idx % 10) * 8) : Math.round(years * 11 + (idx % 8) * 6);
  const yellowPerMatch = (3.2 + (idx % 5) * 0.25).toFixed(1);
  const redCards = Math.round(years * 1.8 + (idx % 4));
  const penalties = Math.round(years * 2.2 + (idx % 6));
  const rating = (8.8 + ((idx % 7) * 0.15)).toFixed(1);

  return {
    matchesCount,
    yellowPerMatch,
    redCards,
    penalties,
    rating: Math.min(9.8, parseFloat(rating)),
  };
}

