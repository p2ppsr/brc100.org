import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const data = JSON.parse(await readFile('data/directory.json','utf8'));
const collator = new Intl.Collator('en', {sensitivity:'base'});
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external = '<svg class="icon" aria-hidden="true"><use href="#external"/></svg>';
function entries(kind) {
  assert(Array.isArray(data[kind]) && data[kind].length, kind+' must contain entries');
  const names = new Set();
  for (const item of data[kind]) {
    for (const field of ['name','vendor','url','description','integration','evidence']) assert(typeof item[field]==='string' && item[field].trim() && item[field].length<=220,kind+': invalid '+field);
    assert(!names.has(item.name.toLowerCase()),'duplicate directory name: '+item.name); names.add(item.name.toLowerCase());
    for (const field of ['url','evidence']) { const u=new URL(item[field]); assert(u.protocol==='https:' && !u.username && !u.password, 'use a public HTTPS '+field); }
    if (item.links) { assert(Array.isArray(item.links) && item.links.length<=3,'at most three additional links'); for (const link of item.links) { assert(typeof link.label==='string' && link.label.length<=35 && link.label.trim(),'invalid link label'); const u=new URL(link.url); assert(u.protocol==='https:' && !u.username && !u.password,'additional links must be public HTTPS'); } }
    assert(item.reference===undefined || (kind==='wallets' && item.reference===true && item.vendor==='BSV Association'),'reference designation is reserved for BSV Association wallets');
  }
  return [...data[kind]].sort((a,b)=> Number(Boolean(b.reference))-Number(Boolean(a.reference)) || collator.compare(a.name,b.name));
}
function cards(kind) { return entries(kind).map(item => `        <article class="directory-card${item.reference ? ' directory-reference' : ''}"><div class="directory-title"><h4><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.name)} ${external}<span class="sr-only"> (opens in a new tab)</span></a></h4><span class="directory-tag mono">${item.reference ? 'REFERENCE' : escape(item.integration)}</span></div><p class="directory-vendor">${escape(item.vendor)}</p><p>${escape(item.description)}</p><div class="directory-links"><a class="directory-evidence" href="${escape(item.evidence)}" target="_blank" rel="noopener noreferrer">Integration details ${external}<span class="sr-only"> (opens in a new tab)</span></a>${(item.links || []).map(link => ` <a class="directory-evidence" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} ${external}<span class="sr-only"> (opens in a new tab)</span></a>`).join('')}</div></article>`).join('\n'); }
const generated = `<!-- directory:start -->
      <div class="directory-group" id="wallets"><div class="directory-heading"><h3>Wallets</h3><p>Reference implementations first. Other wallets A–Z.</p></div><div class="directory-grid" data-directory="wallets">
${cards('wallets')}
      </div></div>
      <div class="directory-group" id="apps"><div class="directory-heading"><h3>Apps to explore</h3><p>A–Z. Follow each app’s guide to connect a wallet.</p></div><div class="directory-grid" data-directory="apps">
${cards('apps')}
      </div></div>
      <!-- directory:end -->`;
const file='frontend/index.html';
const html=await readFile(file,'utf8');
assert(html.includes('<!-- directory:start -->') && html.includes('<!-- directory:end -->'),'directory markers missing');
const next=html.replace(/<!-- directory:start -->[\s\S]*?<!-- directory:end -->/, generated);
if(process.argv.includes('--check')) assert.equal(html,next,'Directory HTML is stale. Run npm run directory and commit frontend/index.html.');
else if(next!==html) await writeFile(file,next);
console.log(`Directory validated: ${data.wallets.length} wallets, ${data.apps.length} apps; reference wallets first, then alphabetical.`);
