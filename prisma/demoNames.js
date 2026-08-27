/**
 * Romanian demo-name generator for seeding/bootstrap.
 * Keeps generated names realistic (Romanian first/last names, cities) but random.
 * Consumed by prisma/bootstrap.js and prisma/seed.ts (via require).
 */

const PRENUME_M = [
  "Andrei", "Mihai", "Alexandru", "Ionuț", "Vasile", "Bogdan", "Cristian",
  "Daniel", "Dumitru", "Eduard", "Florin", "Gabriel", "Horia", "Ilie",
  "Laurențiu", "Marius", "Nicolae", "Octavian", "Petru", "Radu", "Sorin",
  "Tudor", "Victor", "Zoltan", "Adi", "Ciprian", "Adrian", "Liviu", "Remus",
  "Sergiu", "Teodor", "Ștefan", "Dorin", "Eugen", "Grigore", "Iancu",
  "Laurent", "Maxim", "Mircea", "Ovidiu", "Paul", "Răzvan", "Samuel",
  "Traian", "Ursu", "Valentin", "Walter", "Yurii", "Zaharia"
];

const PRENUME_F = [
  "Ana", "Maria", "Ioana", "Andreea", "Elena", "Sofia", "Alexandra", "Gabriela",
  "Diana", "Cristina", "Simona", "Alina", "Monica", "Claudia", "Florina",
  "Ioana", "Mariana", "Nadia", "Petronela", "Roxana", "Silvia", "Violeta",
  "Adina", "Bianca", "Cosmina", "Denisa", "Emilia", "Florentina", "Gina",
  "Ilinca", "Julia", "Mihaela", "Oana", "Paula", "Raluca", "Sanda",
  "Teodora", "Veronica", "Anca", "Dana", "Eva", "Herta", "Ingrid", "Lavinia"
];

const NUME_FAMILIE = [
  "Popescu", "Ionescu", "Pop", "Radu", "Munteanu", "Stoica", "Marin", "Gheorghe",
  "Dumitru", "Nistor", "Barbu", "Georgescu", "Panait", "Stan", "Vasilescu",
  "Dumitrascu", "Enache", "Floarea", "Grigorescu", "Huseveri", "Ionescu",
  "Jianu", "Lazarescu", "Lungu", "Manole", "Mihailescu", "Mitrea", "Necula",
  "Olteanu", "Pascu", "Preda", "Sandu", "Serban", "Stancu", "Szabo", "Tamas",
  "Tudor", "Ungureanu", "Vasile", "Vintila", "Zaharia", "Berceanu", "Cirstea",
  "Damian", "Ene", "Fedos", "Ghiță", "Horodistea", "Ion", "Kovacs"
];

const ORASE = [
  "București", "Cluj-Napoca", "Timișoara", "Iași", "Brașov", "Constanța",
  "Craiova", "Galați", "Ploiești", "Sibiu", "Bacău", "Bucharest", "Râmnicu Vâlcea",
  "Drobeta-Turnu Severin", "Tulcea", "Suceava", "Baia Mare", "Târgu Mureș",
  "Oradea", "Botoșani", "Herson", "Piatra Neamț", "Râiga", "Focșani", "Târgu Jiu"
];

const CLUB_PREFIX = [
  "FC", "CS", "CSC", "ACS", "AS", "CS Universitar", "CSM", "CSG",
  "SC", "AC", "FK", "FC Rapid", "FC United", "AS Sporting",
];

const CLUB_SUFFIX = [
  "București", "Cluj", "Timișoara", "Iași", "Brașov", "Constanța", "Craiova",
  "Galați", "Sibiu", "Suceava", "Bacău", "Ploiești", "Oradea", "Târgu Mureș",
  "Baia Mare", "Râmnicu Vâlaca", "Drobeta", "Tulcea", "Piatra Neamț", "Botoșani",
  "Deva", "Zalău", "Slobozia", "Târgu Jiu", "Râiga", "Ploiești"
];

const COLORS = [
  "#dc2626", "#1e3a8a", "#fbbf24", "#7c2d12", "#0284c7", "#b91c1c",
  "#ea580c", "#15803d", "#2563eb", "#991b1b", "#7e22ce", "#0f7490",
  "#be123c", "#3730a3", "#115e59", "#a21caf", "#c2410c", "#450a54",
  "#1e40af", "#92400e"
];

const POSITII_FOTPAL = [
  "Portar", "Fundaș Central", "Fundaș Lateral", "Mijlocaș Defensiv",
  "Mijlocaș Creativ", "Mijlocaș Ofensiv", "Atacant Centru", "Extremă",
  "Vârf de Atac", "Mediocampista de Poartă", "Lateral Ofensiv", "Antenaș"
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBool(p = 0.5) { return Math.random() < p; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomNume() {
  const prenume = randomItem([...PRENUME_M, ...PRENUME_F]);
  const nume = randomItem(NUME_FAMILIE);
  return `${prenume} ${nume}`;
}

function randomShortName(teamName) {
  const clean = teamName.replace(/[^A-Za-zăâîșțĂÂÎȘȚ ]/g, "").trim();
  const words = clean.split(" ").filter(Boolean);
  if (words.length === 0) return "XX";
  // Use first letter of prefix + first letters of significant words
  const short = [];
  const skip = new Set(["Municipal", "Universitar", "Forestă", "Textila", "Electroputere", "Luptători", "Eroii"]);
  for (const w of words) {
    const wl = w.toLowerCase();
    if (wl === "fc" || wl === "cs" || wl === "acs" || wl === "as" || wl === "sc" || wl === "cfr" || wl === "fk" || wl === "cf" || wl === "gaz" || wl === "h") continue;
    if (skip.has(w)) continue;
    short.push(w[0]);
  }
  if (short.length === 0) {
    short.push(words[0][0]);
    if (words.length > 1) short.push(words[words.length - 1][0]);
  }
  let result = short.join("").toUpperCase().slice(0, 4);
  // Ensure at least 2 chars for a meaningful short name
  if (result.length < 2 && words.length >= 2) {
    result += words[words.length - 1][0].toUpperCase();
  }
  return result || "XX";
}

function randomTeamName() {
  const prefix = randomBool(0.75) ? randomItem(CLUB_PREFIX) : randomItem(["CS", "FC", "AS", "SC"]);
  const suffix = randomItem(CLUB_SUFFIX);
  const middle = randomBool(0.35) ? randomItem(["Universitar", "Municipal", "Forestă", "Textila", "Electroputere", "Luptători", "Eroii"]) : "";
  const parts = [prefix, middle, suffix].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function randomTeam() {
  const name = randomTeamName();
  return {
    name,
    shortName: randomShortName(name),
    color: randomItem(COLORS),
  };
}

function randomPrenumeVietnam() {
  // Optional stylistic: keep Romanian names only (per request).
  return randomNume();
}

function randomPlayer(teamShort) {
  const nume = randomNume();
  return {
    name: nume,
    teamShort,
    number: randomInt(1, 99),
    position: randomItem(POSITII_FOTPAL),
    goals: randomInt(0, 28),
    matchesCount: randomInt(2, 35),
    assists: randomInt(0, 15),
    rating: parseFloat((randomInt(65, 99) / 10).toFixed(1)),
    image: null,
  };
}

const ORASE_USED = [];
function randomOras(unique = false) {
  if (!unique) return randomItem(ORASE);
  let city;
  for (let i = 0; i < 20; i++) {
    city = randomItem(ORASE);
    if (!ORASE_USED.includes(city)) { ORASE_USED.push(city); return city; }
  }
  return city;
}

module.exports = {
  PRENUME_M, PRENUME_F, NUME_FAMILIE, ORASE, CLUB_PREFIX, CLUB_SUFFIX,
  COLORS, POSITII_FOTPAL,
  randomItem, randomInt, randomBool,
  randomNume, randomTeamName, randomShortName,
  randomTeam, randomPlayer, randomOras,
};
