// One-off: the theme migration left `text-white` on light surfaces, making text invisible.
// Only rewrite occurrences whose own className has no dark background.
const fs = require('fs');
const path = require('path');

const DARK_BG = /bg-gradient|grad-brand|grad-ignite|bg-brand-[5-9]|bg-ignite-[5-9]|bg-\[#|bg-black|bg-ink|from-\[#|bg-positive-|bg-critical-|bg-warning-/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

let totalChanged = 0;
const report = [];

for (const file of walk(path.join(__dirname, '..', 'src'))) {
  const src = fs.readFileSync(file, 'utf8');
  let changed = 0;

  // Match className="..." and className={`...`} contents
  const out = src.replace(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g, (match, dq, tq) => {
    const body = dq !== undefined ? dq : tq;
    if (!body.includes('text-white')) return match;
    if (DARK_BG.test(body)) return match;
    changed++;
    const fixed = body.replace(/\btext-white\b/g, 'text-ink');
    return dq !== undefined ? `className="${fixed}"` : 'className={`' + fixed + '`}';
  });

  if (changed) {
    fs.writeFileSync(file, out);
    totalChanged += changed;
    report.push(`${changed}\t${path.relative(process.cwd(), file)}`);
  }
}

console.log(report.join('\n'));
console.log(`\nTOTAL: ${totalChanged} occurrences in ${report.length} files`);
