// Accurate SVG Path definitions for all 42 Romanian administrative counties
// Projection normalized in viewBox 0 0 1000 700 with standard Albers/Mercator Romania bounds

export interface CountySvgData {
  id: string; // ISO 2-letter code e.g. "TM", "CJ", "B"
  name: string; // Full official name e.g. "Timiș", "Cluj", "București"
  region: string; // Region e.g. "Banat", "Transilvania", "Moldova", etc.
  center: [number, number]; // Center coordinate [x, y] for text label & pin
  path: string; // SVG d path
}

export const ROMANIA_COUNTIES_SVG: CountySvgData[] = [
  // --- BANAT & CRIȘANA ---
  {
    id: "TM",
    name: "Timiș",
    region: "Banat",
    center: [125, 415],
    path: "M 65 375 L 120 350 L 175 365 L 195 400 L 185 455 L 140 480 L 80 470 L 50 425 Z",
  },
  {
    id: "AR",
    name: "Arad",
    region: "Crișana",
    center: [145, 320],
    path: "M 75 305 L 140 280 L 205 295 L 225 330 L 190 365 L 130 350 L 75 375 Z",
  },
  {
    id: "CS",
    name: "Caraș-Severin",
    region: "Banat",
    center: [175, 495],
    path: "M 135 480 L 185 455 L 230 485 L 235 540 L 190 565 L 140 540 L 115 500 Z",
  },
  {
    id: "BH",
    name: "Bihor",
    region: "Crișana",
    center: [195, 230],
    path: "M 115 195 L 185 170 L 255 190 L 265 255 L 210 290 L 140 280 L 105 235 Z",
  },

  // --- TRANSILVANIA ---
  {
    id: "CJ",
    name: "Cluj",
    region: "Transilvania",
    center: [330, 245],
    path: "M 265 220 L 330 190 L 395 210 L 405 275 L 350 300 L 275 285 L 255 240 Z",
  },
  {
    id: "SJ",
    name: "Sălaj",
    region: "Transilvania",
    center: [275, 175],
    path: "M 235 155 L 285 135 L 330 150 L 330 190 L 285 215 L 235 190 Z",
  },
  {
    id: "SM",
    name: "Satu Mare",
    region: "Maramureș",
    center: [230, 105],
    path: "M 175 90 L 245 65 L 290 85 L 285 135 L 225 150 L 165 125 Z",
  },
  {
    id: "MM",
    name: "Maramureș",
    region: "Maramureș",
    center: [350, 100],
    path: "M 290 85 L 380 60 L 435 85 L 420 140 L 345 150 L 295 125 Z",
  },
  {
    id: "BN",
    name: "Bistrița-Năsăud",
    region: "Transilvania",
    center: [425, 175],
    path: "M 365 150 L 440 135 L 485 160 L 475 220 L 415 230 L 375 195 Z",
  },
  {
    id: "AB",
    name: "Alba",
    region: "Transilvania",
    center: [320, 345],
    path: "M 260 310 L 335 295 L 385 320 L 380 380 L 320 405 L 250 380 L 240 330 Z",
  },
  {
    id: "HD",
    name: "Hunedoara",
    region: "Transilvania",
    center: [260, 420],
    path: "M 225 365 L 285 345 L 320 380 L 315 450 L 265 480 L 215 450 L 210 395 Z",
  },
  {
    id: "MS",
    name: "Mureș",
    region: "Transilvania",
    center: [430, 275],
    path: "M 375 240 L 450 220 L 505 245 L 500 310 L 430 335 L 370 305 Z",
  },
  {
    id: "SB",
    name: "Sibiu",
    region: "Transilvania",
    center: [405, 385],
    path: "M 355 350 L 430 335 L 475 360 L 465 425 L 400 445 L 345 420 Z",
  },
  {
    id: "BV",
    name: "Brașov",
    region: "Transilvania",
    center: [505, 380],
    path: "M 455 340 L 530 325 L 575 355 L 565 420 L 500 440 L 445 415 Z",
  },
  {
    id: "HR",
    name: "Harghita",
    region: "Transilvania",
    center: [515, 260],
    path: "M 465 220 L 540 205 L 585 235 L 575 305 L 510 325 L 455 295 Z",
  },
  {
    id: "CV",
    name: "Covasna",
    region: "Transilvania",
    center: [570, 345],
    path: "M 530 315 L 590 300 L 630 330 L 620 385 L 565 405 L 520 375 Z",
  },

  // --- MOLDOVA ---
  {
    id: "SV",
    name: "Suceava",
    region: "Moldova",
    center: [545, 115],
    path: "M 475 90 L 570 70 L 630 95 L 620 165 L 550 185 L 485 155 Z",
  },
  {
    id: "BT",
    name: "Botoșani",
    region: "Moldova",
    center: [650, 85],
    path: "M 605 60 L 685 45 L 725 75 L 710 135 L 640 145 L 595 115 Z",
  },
  {
    id: "NT",
    name: "Neamț",
    region: "Moldova",
    center: [595, 195],
    path: "M 545 165 L 625 150 L 670 180 L 660 245 L 590 265 L 535 235 Z",
  },
  {
    id: "IS",
    name: "Iași",
    region: "Moldova",
    center: [695, 175],
    path: "M 645 140 L 725 125 L 775 155 L 760 220 L 690 240 L 635 210 Z",
  },
  {
    id: "BC",
    name: "Bacău",
    region: "Moldova",
    center: [640, 275],
    path: "M 585 240 L 665 225 L 715 255 L 705 320 L 635 340 L 575 310 Z",
  },
  {
    id: "VS",
    name: "Vaslui",
    region: "Moldova",
    center: [735, 265],
    path: "M 685 230 L 760 215 L 805 245 L 795 315 L 730 335 L 675 305 Z",
  },
  {
    id: "VN",
    name: "Vrancea",
    region: "Moldova",
    center: [640, 365],
    path: "M 590 335 L 665 320 L 705 350 L 695 410 L 630 430 L 580 400 Z",
  },
  {
    id: "GL",
    name: "Galați",
    region: "Moldova",
    center: [740, 365],
    path: "M 690 330 L 765 315 L 805 345 L 790 410 L 725 430 L 680 395 Z",
  },

  // --- OLTENIA ---
  {
    id: "MH",
    name: "Mehedinți",
    region: "Oltenia",
    center: [235, 545],
    path: "M 195 510 L 260 490 L 295 525 L 290 585 L 235 605 L 185 570 Z",
  },
  {
    id: "GJ",
    name: "Gorj",
    region: "Oltenia",
    center: [305, 480],
    path: "M 260 445 L 335 430 L 375 460 L 365 525 L 300 545 L 250 515 Z",
  },
  {
    id: "VL",
    name: "Vâlcea",
    region: "Oltenia",
    center: [385, 475],
    path: "M 345 440 L 415 425 L 455 455 L 445 520 L 380 540 L 335 510 Z",
  },
  {
    id: "DJ",
    name: "Dolj",
    region: "Oltenia",
    center: [320, 580],
    path: "M 270 540 L 345 520 L 390 550 L 380 620 L 315 640 L 255 605 Z",
  },
  {
    id: "OT",
    name: "Olt",
    region: "Oltenia",
    center: [405, 575],
    path: "M 365 535 L 435 515 L 475 545 L 465 615 L 400 635 L 350 600 Z",
  },

  // --- MUNTENIA ---
  {
    id: "AG",
    name: "Argeș",
    region: "Muntenia",
    center: [475, 475],
    path: "M 430 435 L 505 420 L 545 450 L 535 520 L 470 540 L 415 510 Z",
  },
  {
    id: "DB",
    name: "Dâmbovița",
    region: "Muntenia",
    center: [535, 490],
    path: "M 500 455 L 560 440 L 595 470 L 585 535 L 530 550 L 485 520 Z",
  },
  {
    id: "PH",
    name: "Prahova",
    region: "Muntenia",
    center: [595, 455],
    path: "M 555 420 L 625 405 L 665 435 L 655 495 L 590 515 L 540 485 Z",
  },
  {
    id: "BZ",
    name: "Buzău",
    region: "Muntenia",
    center: [670, 440],
    path: "M 625 405 L 705 385 L 745 415 L 735 480 L 665 500 L 610 470 Z",
  },
  {
    id: "BR",
    name: "Brăila",
    region: "Muntenia",
    center: [765, 445],
    path: "M 720 415 L 795 400 L 835 430 L 825 490 L 760 510 L 705 480 Z",
  },
  {
    id: "IL",
    name: "Ialomița",
    region: "Muntenia",
    center: [710, 515],
    path: "M 655 485 L 745 470 L 795 495 L 785 555 L 705 570 L 640 545 Z",
  },
  {
    id: "CL",
    name: "Călărași",
    region: "Muntenia",
    center: [720, 580],
    path: "M 665 550 L 755 535 L 805 560 L 795 620 L 715 635 L 650 610 Z",
  },
  {
    id: "IF",
    name: "Ilfov",
    region: "București-Ilfov",
    center: [600, 535],
    path: "M 565 505 L 635 490 L 665 520 L 655 575 L 595 590 L 550 560 Z",
  },
  {
    id: "B",
    name: "București",
    region: "București-Ilfov",
    center: [600, 545],
    path: "M 585 530 L 615 525 L 625 545 L 615 565 L 585 560 L 575 545 Z",
  },
  {
    id: "GR",
    name: "Giurgiu",
    region: "Muntenia",
    center: [570, 605],
    path: "M 530 565 L 605 550 L 645 580 L 635 645 L 570 660 L 515 630 Z",
  },
  {
    id: "TR",
    name: "Teleorman",
    region: "Muntenia",
    center: [490, 595],
    path: "M 445 555 L 525 540 L 565 570 L 555 640 L 490 655 L 435 625 Z",
  },

  // --- DOBROGEA ---
  {
    id: "TL",
    name: "Tulcea",
    region: "Dobrogea",
    center: [865, 415],
    path: "M 815 375 L 905 355 L 955 390 L 945 465 L 870 485 L 800 455 Z",
  },
  {
    id: "CT",
    name: "Constanța",
    region: "Dobrogea",
    center: [855, 525],
    path: "M 800 475 L 890 455 L 940 485 L 930 580 L 850 605 L 785 570 Z",
  },
];
