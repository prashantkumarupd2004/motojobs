// Audit: find `text-ink` on an element whose PARENT (previous open tag) has a dark background.
// The contrast fix only inspected each element's own className, so children of gradient
// wrappers were wrongly flipped from text-white.
const fs = require('fs');
const path = require('path');

const DARK_BG = /bg-gradient|grad-brand|grad-ignite|bg-brand-[5-9]|bg-ignite-[5-9]|bg-black|from-\[#/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

for (const file of walk(path.join(__dirname, '..', 'src'))) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (!line.includes('text-ink"') && !line.includes('text-ink ')) return;
    // look back up to 3 lines for an opening tag with a dark background
    for (let k = 1; k <= 3; k++) {
      const prev = lines[i - k];
      if (!prev) break;
      if (DARK_BG.test(prev) && prev.includes('<div')) {
        console.log(`${path.relative(process.cwd(), file)}:${i + 1}\n    parent: ${prev.trim().slice(0, 110)}\n    child:  ${line.trim().slice(0, 110)}\n`);
        break;
      }
    }
  });
}
