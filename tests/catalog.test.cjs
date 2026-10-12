// SPDX-License-Identifier: GPL-3.0-or-later
const {test}=require('node:test'),assert=require('node:assert/strict');
const games=require('../catalog/store/games.json');
test('full bundled catalog is valid; imported PS4, PS5 and custom titles are accepted',async()=>{const {validateCatalog}=await import('../src/lib/desktopCatalog.ts');assert.equal(validateCatalog(games).length,2069);for(const platform of ['PS4','PS5','Custom'])assert.equal(validateCatalog([{...games[0],platform}])[0].platform,platform);});
test('catalog rejects duplicate identifiers, unsafe artwork and invalid platform types',async()=>{const {validateCatalog}=await import('../src/lib/desktopCatalog.ts');assert.throws(()=>validateCatalog([games[0],games[0]]));assert.throws(()=>validateCatalog([{...games[0],id:'../escape'}]));assert.throws(()=>validateCatalog([{...games[0],images:{...games[0].images,cover:'javascript:alert(1)'}}]));assert.throws(()=>validateCatalog([{...games[0],platform:{}}]));});
