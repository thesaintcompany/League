const fs = require("fs");

// Proper-ish JSX tag stack tracker for one file.
function analyze(file) {
  const s = fs.readFileSync(file, "utf8");
  const lines = s.split("\n");
  // Track JS context: string literals and template literals and comments
  const OPEN_TAG = /^<([A-Za-z][\w:-]*)/; // <div, <span
  const SELF_CLOSE = /\/>\s*$/;
  const CLOSE_TAG = /^<\/([A-Za-z][\w:-]*)/;

  let stack = []; // array of {tag, line}
  let inDString = false, inSString = false, inComment = false,
      inTemplate = false, depthParens = 0, depthBrace = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    let j = 0;
    while (j < l.length) {
      const ch = l[j];
      const two = l.slice(j, j + 2);

      // Handle comments // and /* */
      if (!inDString && !inSString && !inTemplate) {
        if (two === "//") {
          // rest of line comment
          break;
        }
        if (two === "/*") {
          inComment = true; j += 2; continue;
        }
        if (inComment) {
          if (two === "*/") { inComment = false; j += 2; continue; }
          j++; continue;
        }
      }

      // Handle strings (outside template)
      if (!inTemplate) {
        if (inDString) {
          if (ch === "\\") { j += 2; continue; }
          if (ch === '"') { inDString = false; j++; continue; }
          j++; continue;
        }
        if (inSString) {
          if (ch === "\\") { j += 2; continue; }
          if (ch === "'") { inSString = false; j++; continue; }
          j++; continue;
        }
        // entering template
        if (ch === "`") { inTemplate = true; j++; continue; }
        if (ch === '"') { inDString = true; j++; continue; }
        if (ch === "'") { inSString = true; j++; continue; }
        // JSX detection — only meaningful if not in string/template
        if (ch === "<") {
          // Check if it's JSX (not <=, !=, <>, etc.). For our purposes, assume JSX if starts with <letter or </letter
          const rest = l.slice(j);
          const om = rest.match(/^<\/([A-Za-z][\w:-]*)/);
          if (om) {
            // close tag
            if (stack.length > 0) {
              const top = stack[stack.length - 1];
              if (top.tag === om[1]) stack.pop();
              else {
                console.log((i+1) + " [MISMATCH close] expected </" + top.tag + " from line " + top.line + " but got </" + om[1] + ">");
                // pop to recover
                const idx = stack.findLastIndex(t => t.tag === om[1]);
                if (idx >= 0) stack = stack.slice(0, idx);
              }
            } else {
              console.log((i+1) + " [ORPHAN close] </" + om[1] + ">");
            }
            j += 2 + om[1].length; continue;
          }
          const om2 = rest.match(/^<([A-Za-z][\w:-]*)/);
          if (om2) {
            // opening tag — check self-closing later
            // collect until >
            let k = j + 1;
            let closed = false;
            let tagEnd = -1;
            while (k < l.length) {
              if (l[k] === ">") { tagEnd = k; break; }
              if (l[k] === "\n") break; // multiline, handled by accumulating
              k++;
            }
            // Since we process per-line, we can only handle single-line tags here.
            // For multiline, we assume the tag continues.
            if (tagEnd >= 0) {
              // find if self closing
              const before = l.slice(j, tagEnd);
              const self = SELF_CLOSE.test(before);
              const tag = om2[1];
              if (/br|img|input|hr|meta|link|area|base|col|embed|source|track|wbr/i.test(tag)) {
                // void — don't push
              } else {
                if (!self) stack.push({ tag, line: i + 1 });
              }
              j = tagEnd + 1; continue;
            } else {
              // multiline tag opening — push placeholder, will be closed next lines; skip
              stack.push({ tag: om2[1], line: i + 1, multiline: true });
              j += 1 + om2[1].length; continue;
            }
          }
          j++; continue;
        }
        // non-JSX chars
        j++; continue;
      } else {
        // in template literal
        if (ch === "\\") { j += 2; continue; }
        if (two === "${") { depthBrace++; j += 2; continue; }
        if (depthBrace > 0) {
          if (ch === "{") depthBrace++;
          if (ch === "}") depthBrace--;
          if (depthBrace === 0) { inTemplate = false; }
          j++; continue;
        }
        if (ch === "`") { inTemplate = false; j++; continue; }
        j++; continue;
      }
    }
  }
  return stack;
}

for (const f of process.argv.slice(2)) {
  const st = analyze(f);
  console.log(f + " => remaining open tags:");
  st.forEach(t => console.log("   <" + t.tag + " @line " + t.line + (t.multiline ? " (multiline-open)" : "") + ">"));
}
