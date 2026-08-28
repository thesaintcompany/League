const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../scripts/seed_30_referees.js');
let content = fs.readFileSync(target, 'utf8');

const femaleNames = ["alina", "iuliana", "elena", "diana", "roxana", "alexandra", "ioana", "peșu", "pesu", "demetrescu"];
const maleUniforms = [
  "/images/referees/referee-2.jpg",
  "/images/referees/referee-1.jpg",
  "/images/referees/referee-5.jpg",
  "/images/referees/referee-4.jpg",
  "/images/referees/referee-6.jpg",
];

let maleIdx = 0;
// Parse objects and update images
content = content.replace(/\{[\s\S]*?email:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?image:\s*"([^"]+)"[\s\S]*?coverPhotoUrl:\s*"([^"]+)"[\s\S]*?\}/g, (block, email, name, img, cover) => {
  const isFemale = femaleNames.some(f => name.toLowerCase().includes(f));
  const photo = isFemale ? "/images/referees/referee-3.jpg" : maleUniforms[maleIdx++ % maleUniforms.length];
  
  let newBlock = block.replace(new RegExp(img.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), photo);
  newBlock = newBlock.replace(new RegExp(cover.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), photo);
  return newBlock;
});

// Clean up badges
content = content.replace(/refereeBadge:\s*"\s+([^"]+)"/g, 'refereeBadge: "RIFA $1"');
content = content.replace(/Arbitru\s+([A-Z])/g, 'Arbitru RIFA $1');
content = content.replace(/Arbitră\s+([A-Z])/g, 'Arbitră RIFA $1');

fs.writeFileSync(target, content, 'utf8');
console.log('Successfully updated scripts/seed_30_referees.js with authentic referee uniform photos and clean RIFA badges!');
