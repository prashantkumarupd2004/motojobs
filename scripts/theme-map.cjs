#!/usr/bin/env node
/**
 * Bulk dark -> premium-white token mapping for remaining pages.
 * Purely swaps className color tokens. Never touches logic.
 */
const fs = require('fs');

const FILES = process.argv.slice(2);

// Ordered: most specific first.
const MAP = [
  // ---------- surfaces / page shells ----------
  [/\bbg-slate-950\b/g, 'bg-canvas'],
  [/\bbg-slate-900\/(\d+)\b/g, 'bg-white/$1'],
  [/\bbg-slate-900\b/g, 'bg-white'],
  [/\bbg-slate-800\/(\d+)\b/g, 'bg-white/$1'],
  [/\bbg-slate-800\b/g, 'bg-white'],
  [/\bbg-slate-750\b/g, 'bg-canvas'],
  [/\bbg-slate-700\/(\d+)\b/g, 'bg-canvas'],
  [/\bbg-slate-700\b/g, 'bg-canvas'],
  [/\bbg-slate-600\b/g, 'bg-line'],
  [/\bbg-slate-500\b/g, 'bg-ink-faint'],

  // ---------- borders ----------
  [/\bborder-slate-900\b/g, 'border-line'],
  [/\bborder-slate-800\b/g, 'border-line'],
  [/\bborder-slate-700\/(\d+)\b/g, 'border-line'],
  [/\bborder-slate-700\b/g, 'border-line'],
  [/\bborder-slate-600\b/g, 'border-line'],
  [/\bborder-slate-500\b/g, 'border-line'],
  [/\bdivide-slate-800\b/g, 'divide-line-soft'],
  [/\bdivide-slate-700\b/g, 'divide-line-soft'],
  [/\bdivide-slate-600\b/g, 'divide-line-soft'],

  // ---------- text ----------
  [/\btext-slate-100\b/g, 'text-ink'],
  [/\btext-slate-200\b/g, 'text-ink'],
  [/\btext-slate-300\b/g, 'text-ink-soft'],
  [/\btext-slate-400\b/g, 'text-ink-muted'],
  [/\btext-slate-500\b/g, 'text-ink-faint'],
  [/\btext-slate-600\b/g, 'text-ink-faint'],
  [/\btext-slate-700\b/g, 'text-ink-soft'],
  [/\bplaceholder-slate-400\b/g, 'placeholder-ink-faint'],
  [/\bplaceholder-slate-500\b/g, 'placeholder-ink-faint'],
  [/\bplaceholder-slate-600\b/g, 'placeholder-ink-faint'],

  // ---------- hover: surfaces ----------
  [/\bhover:bg-slate-900\b/g, 'hover:bg-canvas'],
  [/\bhover:bg-slate-800\/(\d+)\b/g, 'hover:bg-canvas'],
  [/\bhover:bg-slate-800\b/g, 'hover:bg-canvas'],
  [/\bhover:bg-slate-700\/(\d+)\b/g, 'hover:bg-canvas'],
  [/\bhover:bg-slate-700\b/g, 'hover:bg-canvas'],
  [/\bhover:bg-slate-600\b/g, 'hover:bg-canvas'],
  [/\bhover:border-slate-600\b/g, 'hover:border-brand-200'],
  [/\bhover:border-slate-500\b/g, 'hover:border-brand-200'],
  [/\bhover:text-white\b/g, 'hover:text-ink'],
  [/\bhover:text-slate-100\b/g, 'hover:text-ink'],
  [/\bhover:text-slate-200\b/g, 'hover:text-ink'],
  [/\bhover:text-slate-300\b/g, 'hover:text-ink-soft'],

  // ---------- indigo / purple / violet => brand blue ----------
  [/\bbg-indigo-500\/(\d+)\b/g, 'bg-brand-50'],
  [/\bbg-indigo-600\/(\d+)\b/g, 'bg-brand-50'],
  [/\bbg-indigo-500\b/g, 'bg-brand-500'],
  [/\bbg-indigo-600\b/g, 'bg-brand-600'],
  [/\bbg-indigo-700\b/g, 'bg-brand-700'],
  [/\bhover:bg-indigo-500\b/g, 'hover:bg-brand-500'],
  [/\bhover:bg-indigo-600\b/g, 'hover:bg-brand-600'],
  [/\bhover:bg-indigo-700\b/g, 'hover:bg-brand-700'],
  [/\bborder-indigo-500\/(\d+)\b/g, 'border-brand-100'],
  [/\bborder-indigo-400\/(\d+)\b/g, 'border-brand-200'],
  [/\bborder-indigo-500\b/g, 'border-brand-300'],
  [/\bhover:border-indigo-500\/(\d+)\b/g, 'hover:border-brand-200'],
  [/\bhover:border-indigo-500\b/g, 'hover:border-brand-300'],
  [/\bhover:border-indigo-400\/(\d+)\b/g, 'hover:border-brand-200'],
  [/\btext-indigo-200\b/g, 'text-brand-700'],
  [/\btext-indigo-300\b/g, 'text-brand-700'],
  [/\btext-indigo-400\b/g, 'text-brand-600'],
  [/\btext-indigo-500\b/g, 'text-brand-600'],
  [/\btext-indigo-600\b/g, 'text-brand-700'],
  [/\bhover:text-indigo-200\b/g, 'hover:text-brand-800'],
  [/\bhover:text-indigo-300\b/g, 'hover:text-brand-800'],
  [/\bhover:text-indigo-400\b/g, 'hover:text-brand-700'],
  [/\bfocus:border-indigo-500\b/g, 'focus:border-brand-600'],
  [/\bfocus:ring-indigo-500\/(\d+)\b/g, 'focus:ring-brand-600/20'],
  [/\bfocus:ring-indigo-500\b/g, 'focus:ring-brand-600'],
  [/\bring-indigo-500\b/g, 'ring-brand-600'],

  [/\bbg-purple-500\/(\d+)\b/g, 'bg-ignite-50'],
  [/\bbg-purple-600\/(\d+)\b/g, 'bg-ignite-50'],
  [/\bbg-purple-500\b/g, 'bg-ignite-500'],
  [/\bbg-purple-600\b/g, 'bg-ignite-600'],
  [/\bhover:bg-purple-500\b/g, 'hover:bg-ignite-500'],
  [/\bhover:bg-purple-600\b/g, 'hover:bg-ignite-600'],
  [/\bborder-purple-500\/(\d+)\b/g, 'border-ignite-100'],
  [/\bborder-purple-500\b/g, 'border-ignite-300'],
  [/\bhover:border-purple-500\b/g, 'hover:border-ignite-300'],
  [/\btext-purple-300\b/g, 'text-ignite-700'],
  [/\btext-purple-400\b/g, 'text-ignite-600'],
  [/\btext-purple-500\b/g, 'text-ignite-600'],
  [/\btext-purple-600\b/g, 'text-ignite-700'],
  [/\bbg-violet-500\/(\d+)\b/g, 'bg-ignite-50'],
  [/\bbg-violet-500\b/g, 'bg-ignite-500'],
  [/\btext-violet-400\b/g, 'text-ignite-600'],
  [/\bborder-violet-500\/(\d+)\b/g, 'border-ignite-100'],

  // ---------- semantic: emerald/green => positive ----------
  [/\bbg-emerald-500\/(\d+)\b/g, 'bg-positive-soft'],
  [/\bbg-emerald-600\/(\d+)\b/g, 'bg-positive-soft'],
  [/\bbg-green-500\/(\d+)\b/g, 'bg-positive-soft'],
  [/\bborder-emerald-500\/(\d+)\b/g, 'border-[#BEE7D8]'],
  [/\bborder-emerald-500\b/g, 'border-[#BEE7D8]'],
  [/\bborder-green-500\/(\d+)\b/g, 'border-[#BEE7D8]'],
  [/\btext-emerald-300\b/g, 'text-[#0A7A54]'],
  [/\btext-emerald-400\b/g, 'text-[#0A7A54]'],
  [/\btext-emerald-500\b/g, 'text-positive'],
  [/\btext-emerald-600\b/g, 'text-[#0A7A54]'],
  [/\btext-green-400\b/g, 'text-[#0A7A54]'],
  [/\bhover:text-emerald-300\b/g, 'hover:text-[#0A7A54]'],
  [/\bhover:bg-emerald-500\b/g, 'hover:bg-positive'],
  [/\bhover:bg-emerald-600\b/g, 'hover:bg-positive'],
  [/\bbg-emerald-600\b/g, 'bg-positive'],
  [/\bbg-emerald-500\b/g, 'bg-positive'],

  // ---------- semantic: amber/yellow/orange => caution ----------
  [/\bbg-amber-500\/(\d+)\b/g, 'bg-caution-soft'],
  [/\bbg-amber-600\/(\d+)\b/g, 'bg-caution-soft'],
  [/\bbg-yellow-500\/(\d+)\b/g, 'bg-caution-soft'],
  [/\bborder-amber-500\/(\d+)\b/g, 'border-[#F3DBB4]'],
  [/\bborder-amber-500\b/g, 'border-[#F3DBB4]'],
  [/\btext-amber-300\b/g, 'text-[#9A5D00]'],
  [/\btext-amber-400\b/g, 'text-[#9A5D00]'],
  [/\btext-amber-500\b/g, 'text-caution'],
  [/\btext-yellow-400\b/g, 'text-[#9A5D00]'],
  [/\bbg-amber-500\b/g, 'bg-caution'],
  [/\bhover:bg-amber-500\b/g, 'hover:bg-caution'],

  // ---------- semantic: rose/red => critical ----------
  [/\bbg-rose-500\/(\d+)\b/g, 'bg-critical-soft'],
  [/\bbg-rose-600\/(\d+)\b/g, 'bg-critical-soft'],
  [/\bbg-red-500\/(\d+)\b/g, 'bg-critical-soft'],
  [/\bborder-rose-500\/(\d+)\b/g, 'border-[#F3C9C9]'],
  [/\bborder-rose-500\b/g, 'border-[#F3C9C9]'],
  [/\bborder-red-500\/(\d+)\b/g, 'border-[#F3C9C9]'],
  [/\btext-rose-300\b/g, 'text-[#B32B2B]'],
  [/\btext-rose-400\b/g, 'text-[#B32B2B]'],
  [/\btext-rose-500\b/g, 'text-critical'],
  [/\btext-red-400\b/g, 'text-[#B32B2B]'],
  [/\bhover:text-rose-300\b/g, 'hover:text-critical'],
  [/\bhover:text-rose-400\b/g, 'hover:text-critical'],
  [/\bhover:bg-rose-500\/(\d+)\b/g, 'hover:bg-critical-soft'],
  [/\bhover:bg-rose-600\b/g, 'hover:bg-[#C62E2E]'],
  [/\bhover:bg-rose-500\b/g, 'hover:bg-critical'],
  [/\bbg-rose-600\b/g, 'bg-critical'],
  [/\bbg-rose-500\b/g, 'bg-critical'],

  // ---------- semantic: blue/cyan/sky => brand/informative ----------
  [/\bbg-blue-500\/(\d+)\b/g, 'bg-brand-50'],
  [/\bbg-blue-600\/(\d+)\b/g, 'bg-brand-50'],
  [/\bbg-cyan-500\/(\d+)\b/g, 'bg-brand-50'],
  [/\bbg-sky-500\/(\d+)\b/g, 'bg-brand-50'],
  [/\bborder-blue-500\/(\d+)\b/g, 'border-brand-100'],
  [/\bborder-cyan-500\/(\d+)\b/g, 'border-brand-100'],
  [/\bborder-sky-500\/(\d+)\b/g, 'border-brand-100'],
  [/\btext-blue-300\b/g, 'text-brand-700'],
  [/\btext-blue-400\b/g, 'text-brand-600'],
  [/\btext-blue-500\b/g, 'text-brand-600'],
  [/\btext-cyan-300\b/g, 'text-brand-700'],
  [/\btext-cyan-400\b/g, 'text-brand-600'],
  [/\btext-sky-400\b/g, 'text-brand-600'],
  [/\bbg-blue-600\b/g, 'bg-brand-600'],
  [/\bhover:bg-blue-600\b/g, 'hover:bg-brand-600'],

  // ---------- pink => ignite ----------
  [/\bbg-pink-500\/(\d+)\b/g, 'bg-ignite-50'],
  [/\bborder-pink-500\/(\d+)\b/g, 'border-ignite-100'],
  [/\btext-pink-400\b/g, 'text-ignite-600'],
  [/\btext-pink-300\b/g, 'text-ignite-700'],

  // ---------- teal ----------
  [/\bbg-teal-500\/(\d+)\b/g, 'bg-positive-soft'],
  [/\btext-teal-400\b/g, 'text-[#0A7A54]'],
  [/\bborder-teal-500\/(\d+)\b/g, 'border-[#BEE7D8]'],

  // ---------- gradient stops (icon tiles / buttons) ----------
  [/from-indigo-500 to-purple-600/g, 'from-[#1F5D95] to-[#0F4C81]'],
  [/from-indigo-600 to-purple-600/g, 'from-[#1F5D95] to-[#0F4C81]'],
  [/from-indigo-500 to-indigo-600/g, 'from-[#1F5D95] to-[#0F4C81]'],
  [/from-emerald-500 to-teal-600/g, 'from-[#12B37E] to-[#0A8A5F]'],
  [/from-emerald-500 to-emerald-600/g, 'from-[#12B37E] to-[#0A8A5F]'],
  [/from-green-500 to-emerald-600/g, 'from-[#12B37E] to-[#0A8A5F]'],
  [/from-amber-500 to-orange-600/g, 'from-[#FF8533] to-[#E05D00]'],
  [/from-orange-500 to-amber-600/g, 'from-[#FF8533] to-[#E05D00]'],
  [/from-pink-500 to-rose-600/g, 'from-[#FF8533] to-[#B84B00]'],
  [/from-rose-500 to-pink-600/g, 'from-[#E24A4A] to-[#C62E2E]'],
  [/from-cyan-500 to-blue-600/g, 'from-[#4A7FB4] to-[#1F5D95]'],
  [/from-blue-500 to-cyan-600/g, 'from-[#4A7FB4] to-[#1F5D95]'],
  [/from-blue-500 to-indigo-600/g, 'from-[#4A7FB4] to-[#1F5D95]'],
  [/from-violet-500 to-purple-600/g, 'from-[#FF8533] to-[#B84B00]'],
  [/from-purple-500 to-pink-600/g, 'from-[#FF8533] to-[#B84B00]'],
  [/from-purple-500 to-indigo-600/g, 'from-[#1F5D95] to-[#0F4C81]'],
  [/from-slate-700 to-slate-800/g, 'from-[#2B3648] to-[#141A24]'],
  [/from-slate-800 to-slate-900/g, 'from-[#2B3648] to-[#141A24]'],
  [/from-indigo-950 to-purple-950/g, 'from-[#0F4C81] to-[#092E4F]'],
  [/from-indigo-950 via-slate-900 to-purple-950/g, 'from-[#0F4C81] via-[#0C3D68] to-[#092E4F]'],

  // remaining loose gradient stops
  [/\bfrom-indigo-(\d+)\b/g, 'from-brand-$1'],
  [/\bto-indigo-(\d+)\b/g, 'to-brand-$1'],
  [/\bvia-indigo-(\d+)\b/g, 'via-brand-$1'],
  [/\bfrom-purple-(\d+)\b/g, 'from-ignite-$1'],
  [/\bto-purple-(\d+)\b/g, 'to-ignite-$1'],
  [/\bvia-purple-(\d+)\b/g, 'via-ignite-$1'],
  [/\bfrom-slate-(\d+)\b/g, 'from-canvas'],
  [/\bto-slate-(\d+)\b/g, 'to-canvas'],

  // ---------- radii + shadow upgrades ----------
  [/\brounded-xl\b/g, 'rounded-[16px]'],
  [/\brounded-2xl\b/g, 'rounded-[20px]'],
  [/\bshadow-2xl\b/g, 'shadow-[0_16px_32px_rgba(16,24,40,0.07),0_40px_80px_rgba(16,24,40,0.10)]'],
  [/\bshadow-xl\b/g, 'shadow-[0_8px_16px_rgba(16,24,40,0.05),0_24px_48px_rgba(16,24,40,0.08)]'],
  [/\bshadow-lg\b/g, 'shadow-[0_4px_8px_rgba(16,24,40,0.04),0_12px_24px_rgba(16,24,40,0.06)]'],

  // ---------- misc dark leftovers ----------
  [/\bbg-black\/(\d+)\b/g, 'bg-[#0B1220]/35'],
  [/\bbg-slate-\[[^\]]+\]/g, 'bg-canvas'],
  [/\bcard-hover\b/g, 'lift'],
  [/\bshimmer\b/g, 'skeleton'],
];

let totalChanges = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.error('MISSING: ' + file);
    continue;
  }
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [re, to] of MAP) after = after.replace(re, to);
  if (after !== before) {
    fs.writeFileSync(file, after);
    totalChanges++;
    console.log('mapped: ' + file);
  }
}
console.log('\nFiles changed: ' + totalChanges);
