// Revert the over-application: a self-closing icon/span on the line(s) directly inside a
// dark-background wrapper must stay text-white. fix-contrast.cjs only saw each element's own
// className, so these children were wrongly flipped.
const fs = require('fs');
const path = require('path');

const DARK_BG = /bg-gradient-to|grad-brand|grad-ignite|bg-brand-[6-9]\d*|bg-ignite-[6-9]\d*|bg-black|from-\[#[0-9A-Fa-f]/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

let total = 0;
const report = [];

for (const file of walk(path.join(__dirname, '..', 'src'))) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let changed = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!/\btext-ink\b/.test(line)) continue;

    // Only self-closing leaf elements (icons, spans) — never headings or block content.
    const isLeafIcon = /^\s*<[A-Z][A-Za-z0-9]*\s[^>]*\/>\s*$/.test(line);
    if (!isLeafIcon) continue;

    // The immediately preceding non-blank line must OPEN a dark-background div.
    let k = i - 1;
    while (k >= 0 && lines[k].trim() === '') k--;
    const prev = lines[k] || '';
    if (!prev.includes('<div') || prev.includes('</div>')) continue;
    if (!DARK_BG.test(prev)) continue;

    lines[i] = line.replace(/\btext-ink\b/g, 'text-white');
    changed++;
    report.push(`  ${path.relative(process.cwd(), file)}:${i + 1}  ${lines[i].trim().slice(0, 80)}`);
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'));
    total += changed;
  }
}

console.log(report.join('\n'));
console.log(`\nREVERTED: ${total} icon(s) back to text-white`);
