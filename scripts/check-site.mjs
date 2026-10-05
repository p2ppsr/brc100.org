import assert from 'node:assert/strict';
import { readFile, access, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await import('../frontend/examples.js');
const html = await readFile('frontend/index.html','utf8');
assert.equal((html.match(/<h1\b/g) || []).length,1,'one primary heading');
assert(html.includes('https://brc100.org/'),'canonical URL missing');
const ids = new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g),m => m[1]));
for (const [,anchor] of html.matchAll(/\bhref="#([^"]+)"/g)) assert(ids.has(anchor),'missing anchor: '+anchor);
for (const [,asset] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) await access('frontend'+asset);
await access('frontend/assets/social.png');
for (const file of ['frontend/app.js','frontend/examples.js']) {
  const result = spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
}
const catalog = globalThis.BRC_EXAMPLES;
await mkdir('.checks',{recursive:true});
const fixture = 'import { WalletClient } from "@bsv/sdk";\n\n' + Object.keys(catalog.examples).map(id => '{\n'+catalog.code(id,'typescript','Hello, BRC-100.').replace(/^import[^\n]+\n/, '')+'\n}').join('\n\n');
await writeFile('.checks/examples.mts',fixture);
const tsc = spawnSync('node_modules/.bin/tsc',['--noEmit','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--skipLibCheck','--strict','.checks/examples.mts'],{encoding:'utf8'});
assert.equal(tsc.status,0,tsc.stdout+tsc.stderr);
console.log('Site assets, anchors, JavaScript, and all six SDK-typed examples pass.');
