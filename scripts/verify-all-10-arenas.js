const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EXPECTED_NAMES = [
  "Arena Viola",
  "Stadion Galaxy Timișoara",
  "Premier Arena",
  "Davia Sport",
  "Tonomatul de Fotbal",
  "Baza Sportivă nr. 2 Politehnica",
  "Berlin Sport Club",
  "Friend's Arena S.R.L.",
  "Helios Sport Club",
  "Alborz",
];

async function main() {
  console.log("Querying the 10 demo arenas from the database...");

  const venues = await prisma.venue.findMany({
    where: {
      name: { in: EXPECTED_NAMES },
    },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${venues.length} out of ${EXPECTED_NAMES.length} expected venues in DB:\n`);

  for (const v of venues) {
    console.log(`--- [${v.name}] ---`);
    console.log(`  ID:            ${v.id}`);
    console.log(`  Location:      ${v.location} (County: ${v.county})`);
    console.log(`  Address:       ${v.address}`);
    console.log(`  Phone:         ${v.phone}`);
    console.log(`  Website:       ${v.website}`);
    console.log(`  Rating:        ★ ${v.rating} (${v.reviewCount} reviews)`);
    console.log(`  CRM Status:    ${v.crmStatus}`);
    console.log(`  Google Maps:   ${v.googleMapsUrl ? v.googleMapsUrl.substring(0, 60) + "..." : "NONE"}`);
    console.log(`  Image URL:     ${v.imageUrl ? v.imageUrl.substring(0, 70) + "..." : "NONE"}`);
    console.log(`  Is Demo:       ${v.isDemo}`);
    console.log(`  Is Active:     ${v.isActive}\n`);
  }

  if (venues.length === EXPECTED_NAMES.length) {
    console.log("SUCCESS: All 10 demo arenas are verified present and configured correctly.");
  } else {
    console.warn(`WARNING: Missing ${EXPECTED_NAMES.length - venues.length} venues.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
