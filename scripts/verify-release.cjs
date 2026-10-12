// SPDX-License-Identifier: GPL-3.0-or-later
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),pkg=require('../package.json');
const out=path.join(root,'release',`Portlight-${pkg.version}-windows-x64`);
for(const n of ['Portlight.exe','LICENSE','LICENSES.chromium.html','PORTLIGHT-LICENSE.txt','LICENSE-ATTRIBUTION','CREDITS.md','licenses/npm-components.json','resources/app/dist/index.html'])assert.ok(fs.existsSync(path.join(out,n)),n);
let checked=0;
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,item.name);assert.ok(!item.isSymbolicLink(),p);
 if(item.isFile()&&item.name.endsWith('.log'))continue; // excluded by archive.cjs
 assert.ok(!['user-data','archives','clean-elf','prepared','.git','node_modules'].includes(item.name),p);
 if(item.isDirectory()){walk(p);continue;}
 assert.ok(!/\.(elf|prx|wad|pkg)$/i.test(item.name),p);
 if(item.name.endsWith('.pak'))assert.ok(path.relative(out,p).startsWith('locales'+path.sep)||['chrome_100_percent.pak','chrome_200_percent.pak','resources.pak'].includes(path.relative(out,p)),p);
 if(/\.(json|cjs|js|html|md|txt|svg)$/i.test(item.name)&&fs.statSync(p).size<15_000_000){
  const text=fs.readFileSync(p,'utf8');assert.ok(!/C:[\\/]+Users[\\/]+brand|PPSA59322-DTpUid|PPSA99666-H3sdyZ/.test(text),`Personal path: ${p}`);
 }
 checked++;
}}
walk(out);
for(const file of ['desktop.cjs','launcher.cjs','preload.cjs','toolchain.cjs'])assert.ok(fs.readFileSync(path.join(root,file)).equals(fs.readFileSync(path.join(out,'resources/app',file))),`Source/package mismatch: ${file}`);
function sameTree(from,to){for(const item of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,item.name),b=path.join(to,item.name);if(item.isDirectory())sameTree(a,b);else assert.ok(fs.readFileSync(a).equals(fs.readFileSync(b)),`Build/package mismatch: ${b}`);}}
sameTree(path.join(root,'dist'),path.join(out,'resources/app/dist'));
const games=require('../catalog/store/games.json');assert.equal(games.length,2069);assert.equal(new Set(games.map(g=>g.id)).size,2069);
const results=require('../catalog/test-results.json');assert.equal(Object.keys(results).length,13);
for(const g of games)for(const url of [...Object.values(g.images),...g.screenshots])assert.ok(url===''||url.startsWith('https://'));
for(const r of Object.values(results)){assert.ok(!('folder' in r));assert.ok(!('elf' in r));}
console.log(`PASS: ${checked} packaged files checked; 2,069 catalog listings with original artwork links; no game packages, personal paths or user data.`);
