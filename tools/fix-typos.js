const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix broken occurrences of "oficial*" words
  content = content.replace(/\b(Fiș[aă]|Etap[aă]|Deplasare|Delegare|Aren[aă]|Invitați[ae]|Gril[aă]|brigad[aă]|legitimați[ae]|imagin[ae]|Consol[aă]|publicare[aă]|sigl[aă]|List[aă]|pagin[aă]|platform[aă]|Foaia|Foia)\s+ă\b/g, '$1 oficială');
  content = content.replace(/\b(ecusoan[e]|rapoart[e]|delegăr[i]|meciur[i]|regulament[e]|clasament[e]|sancțiun[i]|partener[i]|acredităr[i])\s+e\b/g, '$1 oficiale');
  content = content.replace(/\b(Arbitr[i]|Oficial[i]|participanț[i]|suporter[i])\s+i\b/g, '$1 oficiali');
  content = content.replace(/Arenă\s+ă/g, 'Arenă Oficială');
  content = content.replace(/Etapă\s+ă/g, 'Etapă Oficială');
  content = content.replace(/Fișă\s+ă/g, 'Fișă Oficială');
  content = content.replace(/Invitație\s+ă/g, 'Invitație Oficială');
  content = content.replace(/Siglă\s+ă/g, 'Siglă Oficială');
  content = content.replace(/publicarea\s+ă/g, 'publicarea oficială');
  content = content.replace(/platforma\s+ă/g, 'platforma oficială');
  content = content.replace(/pagina\s+ă/g, 'pagina oficială');
  content = content.replace(/Consola\s+ă/g, 'Consola Oficială');
  content = content.replace(/Lista\s+ă/g, 'Lista Oficială');
  content = content.replace(/Deplasare\s+ă/g, 'Deplasare Oficială');
  content = content.replace(/Delegare\s+ă/g, 'Delegare Oficială');
  content = content.replace(/Foia\s+ă/g, 'Foaia Oficială');
  content = content.replace(/Foaia\s+ă/g, 'Foaia Oficială');
  content = content.replace(/ecusoane\s+e/g, 'ecusoane oficiale');
  content = content.replace(/delegări\s+e/g, 'delegări oficiale');
  content = content.replace(/arbitri\s+i/g, 'arbitri oficiali');
  content = content.replace(/Arbitri\s+i/g, 'Arbitri Oficiali');
  content = content.replace(/ARBITRI\s+I/g, 'ARBITRI OMOLOGAȚI');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalReplacements++;
    console.log(`Cleaned: ${path.relative(path.join(__dirname, '..'), file)}`);
  }
});

console.log(`\nFinished cleaning. Modified ${totalReplacements} files.`);
