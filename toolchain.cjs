// SPDX-License-Identifier: GPL-3.0-or-later
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {checkExe}=require('./launcher.cjs');
async function inspectToolchain(relinker,libs,intel){
 await checkExe(relinker);
 const runtime=fs.realpathSync(libs);
 if(!fs.statSync(runtime).isDirectory()||!fs.readdirSync(runtime).some(n=>n.endsWith('.prx')))throw Error('Choose the runtime libs folder containing AnyPS5 .prx libraries.');
 return {relinker:fs.realpathSync(relinker),libs:runtime,intel:Boolean(intel),sha256:crypto.createHash('sha256').update(fs.readFileSync(relinker)).digest('hex')};
}
function createToolchainStore(dataDir){
 const file=path.join(dataDir,'anyps5.json');
 const get=()=>{try{const t=JSON.parse(fs.readFileSync(file,'utf8'));if(typeof t.relinker==='string'&&typeof t.libs==='string'&&typeof t.sha256==='string')return t;}catch{}return null;};
 const save=async(relinker,libs,intel)=>{const t=await inspectToolchain(relinker,libs,intel);fs.mkdirSync(dataDir,{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(t,null,2));fs.renameSync(file+'.tmp',file);return t;};
 return {get,save};
}
module.exports={inspectToolchain,createToolchainStore};
