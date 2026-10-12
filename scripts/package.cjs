// SPDX-License-Identifier: GPL-3.0-or-later
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),pkg=require('../package.json');
if(process.platform!=='win32'||process.arch!=='x64')throw Error('Package on Windows x64 with Node 24.');
const out=path.join(root,'release',`Portlight-${pkg.version}-windows-x64`);
if(fs.existsSync(out))throw Error('Release staging folder already exists. Move it aside before packaging again.');
if(!fs.existsSync(path.join(root,'dist/index.html')))throw Error('Run npm run build first.');
fs.mkdirSync(out,{recursive:true});
fs.cpSync(path.join(root,'node_modules/electron/dist'),out,{recursive:true});
fs.renameSync(path.join(out,'electron.exe'),path.join(out,'Portlight.exe'));
const app=path.join(out,'resources/app');fs.mkdirSync(app,{recursive:true});
for(const name of ['desktop.cjs','preload.cjs','launcher.cjs','toolchain.cjs'])fs.copyFileSync(path.join(root,name),path.join(app,name));
fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({name:pkg.name,version:pkg.version,main:'desktop.cjs',license:pkg.license},null,2));
fs.cpSync(path.join(root,'dist'),path.join(app,'dist'),{recursive:true});
fs.mkdirSync(path.join(app,'catalog'));fs.copyFileSync(path.join(root,'catalog/test-results.json'),path.join(app,'catalog/test-results.json'));
// Electron's MIT LICENSE remains at the root; the launcher license is separate.
fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'PORTLIGHT-LICENSE.txt'));
for(const name of ['LICENSE-ATTRIBUTION','README.md','CREDITS.md','THIRD-PARTY-NOTICES.md','RELEASE-NOTES.md'])fs.copyFileSync(path.join(root,name),path.join(out,name));
fs.cpSync(path.join(root,'docs'),path.join(out,'docs'),{recursive:true});
fs.cpSync(path.join(root,'licenses'),path.join(out,'licenses'),{recursive:true});
const lock=require('../package-lock.json'),notices=[];
for(const [key,item] of Object.entries(lock.packages)){
 if(!key||item.dev)continue;
 const dir=path.join(root,key);if(!fs.existsSync(dir))throw Error(`Missing dependency ${key}`);
 const meta=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
 const dest=path.join(out,'licenses','npm',meta.name.replaceAll('/','__'));fs.mkdirSync(dest,{recursive:true});
 const files=fs.readdirSync(dir).filter(n=>/^(license|licence|copying|notice)(\.|-|$)/i.test(n)&&fs.statSync(path.join(dir,n)).isFile());
 if(!files.length&&meta.name==='react-remove-scroll-bar'&&meta.version==='2.3.8'){
  fs.copyFileSync(path.join(root,'licenses/react-remove-scroll-bar-LICENSE.txt'),path.join(dest,'LICENSE'));
  notices.push({name:meta.name,version:meta.version,license:meta.license,notices:['LICENSE'],source:'https://raw.githubusercontent.com/theKashey/react-remove-scroll-bar/master/LICENSE',retrieved:'2026-10-12'});continue;
 }
 if(!files.length)throw Error(`No license file found for ${meta.name}`);
 for(const file of files)fs.copyFileSync(path.join(dir,file),path.join(dest,file));
 notices.push({name:meta.name,version:meta.version,license:meta.license,notices:files});
}
fs.writeFileSync(path.join(out,'licenses/npm-components.json'),JSON.stringify(notices,null,2));
console.log(out);
