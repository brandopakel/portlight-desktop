const fs=require('fs'), fsp=fs.promises, path=require('path'), crypto=require('crypto');
const {spawn}=require('child_process');
function safeId(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||['__proto__','constructor','prototype'].includes(id))throw Error('Invalid game ID.');return id;}
async function checkExe(file){
 if(path.extname(file).toLowerCase()!=='.exe')throw Error('Select a Windows .exe file.');
 const f=await fsp.open(file,'r');try{
 const h=Buffer.alloc(64);await f.read(h,0,64,0);if(h.toString('ascii',0,2)!=='MZ')throw Error('Not a Windows executable.');
 const pe=Buffer.alloc(24);await f.read(pe,0,24,h.readUInt32LE(60));
 if(pe.readUInt32LE(0)!==0x4550||pe.readUInt16LE(4)!==0x8664||(pe.readUInt16LE(22)&0x2000))throw Error('Select a 64-bit Windows executable, not a DLL.');
 }finally{await f.close();}
}
function createLauncher({dataDir,getToolchain,spawnProcess=spawn}){
 const stateFile=path.join(dataDir,'local-games.json');
 const running=new Map(),busy=new Set();let records={};
 fs.mkdirSync(dataDir,{recursive:true});
 try{const saved=JSON.parse(fs.readFileSync(stateFile,'utf8'));if(saved&&typeof saved==='object'&&!Array.isArray(saved))records=saved;}catch{}
 const save=()=>{const tmp=stateFile+'.tmp';fs.writeFileSync(tmp,JSON.stringify(records,null,2));fs.renameSync(tmp,stateFile);};
 const set=(id,patch)=>{records[id]={...records[id],...patch};save();};
 const info=id=>{safeId(id);const r=records[id]||{};return {attached:Boolean(r.exe),exe:r.exe||'',running:running.has(id),busy:busy.has(id),message:r.message||'No local game attached.',lastExit:r.lastExit??null,log:r.log||'',source:r.source||'',compatibility:'Unverified'};};
 const ensureFree=id=>{safeId(id);if(busy.has(id)||running.has(id))throw Error('This title is already running or being prepared.');};
 async function attach(id,exe){ensureFree(id);busy.add(id);try{await checkExe(exe);set(id,{exe:path.resolve(exe),source:'attached',message:'Local Windows executable attached. Compatibility is unverified.',lastExit:null,log:''});}finally{busy.delete(id);}return info(id);}
 function child(exe,args,cwd,log,onSpawn){
  return new Promise((resolve,reject)=>{
   const stream=fs.createWriteStream(log,{flags:'w'});let count=0,settled=false;stream.on('error',()=>{});
   const p=spawnProcess(exe,args,{cwd,shell:false,windowsHide:!onSpawn,stdio:['ignore','pipe','pipe']});
   for(const pipe of [p.stdout,p.stderr])pipe?.on('data',chunk=>{if(count<10*1024*1024){const part=chunk.subarray(0,10*1024*1024-count);stream.write(part);count+=part.length;}});
   p.once('spawn',()=>onSpawn?.(p));
   p.once('error',e=>{if(!settled){settled=true;stream.end();reject(e);}});
   p.once('close',(code,signal)=>stream.end(()=>{if(!settled){settled=true;resolve({code,signal});}}));
  });
 }
 async function launch(id){
  ensureFree(id);const r=records[id];if(!r?.exe)throw Error('Attach or prepare local game files first.');
  busy.add(id);try{await checkExe(r.exe);}catch(e){busy.delete(id);throw e;}
  const log=path.join(dataDir,`${id}-launch.log`);set(id,{log,lastExit:null,message:'Starting local executable…'});
  let done;const started=new Promise(resolve=>done=resolve);
  child(r.exe,[],path.dirname(r.exe),log,p=>{running.set(id,p);busy.delete(id);set(id,{message:'Process started. Gameplay compatibility is unverified.'});done();})
   .then(({code,signal})=>{running.delete(id);busy.delete(id);let detail='';try{detail=fs.readFileSync(log,'utf8').split(/\r?\n/).find(line=>/FAIL:|what\(\):|FATAL:/.test(line))?.trim().slice(0,400)||'';}catch{}set(id,{lastExit:code,message:code===0?'Process exited with code 0. Gameplay compatibility is unverified.':`Process exited with ${signal||'code '+code}. ${detail||'Open log for details.'}`});done();})
   .catch(e=>{running.delete(id);busy.delete(id);set(id,{message:`Launch failed: ${e.message}`});done();});
  await started;return info(id);
 }
 async function prepare(id,elf){
  ensureFree(id);busy.add(id);
  try{
   if((await fsp.lstat(elf)).isSymbolicLink())throw Error('Choose a regular ELF file, not a link.');
   const input=await fsp.open(elf,'r'),magic=Buffer.alloc(20);try{await input.read(magic,0,20,0);}finally{await input.close();}
   if(magic.toString('hex',0,4)!=='7f454c46'||magic[4]!==2||magic[5]!==1||magic.readUInt16LE(18)!==62)throw Error('AnyPS5 requires a clean x86-64 ELF. SELF/eboot.bin containers and PKG/exFAT archives cannot be converted here.');
   const source=path.dirname(fs.realpathSync(elf));
   const modules=['sce_module','sce_modules','prx'].filter(n=>fs.existsSync(path.join(source,n)));
   if(modules.includes('sce_module')&&modules.includes('sce_modules'))throw Error('Use only one of sce_module or sce_modules.');
   const tool=await getToolchain();const relinker=tool.relinker;
   await checkExe(relinker);
   if(crypto.createHash('sha256').update(await fsp.readFile(relinker)).digest('hex')!==tool.sha256)throw Error('AnyPS5 changed since configuration. Select it again with Configure AnyPS5.');
   const prepared=path.resolve(dataDir,'prepared'),relative=path.relative(source,prepared);
   if(relative===''||(relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative)))throw Error('Choose source files outside the app data folder.');
   await fsp.mkdir(prepared,{recursive:true});const dest=await fsp.mkdtemp(path.join(prepared,id+'-'));
   const app0=path.join(dest,'app0');await fsp.mkdir(app0);
   const log=path.join(dest,'conversion.log');set(id,{message:'Copying game resources…',log});
   async function copyTree(from,to){
    const stat=await fsp.lstat(from);if(stat.isSymbolicLink())throw Error('Source contains a symbolic link; use a regular game folder.');
    if(stat.isDirectory()){await fsp.mkdir(to,{recursive:true});for(const n of await fsp.readdir(from))await copyTree(path.join(from,n),path.join(to,n));}
    else if(stat.isFile())await fsp.copyFile(from,to);
   }
   async function noLinks(from){const s=await fsp.lstat(from);if(s.isSymbolicLink())throw Error('Linked module paths are not supported.');if(s.isDirectory())for(const n of await fsp.readdir(from))await noLinks(path.join(from,n));}
   for(const n of modules)await noLinks(path.join(source,n));
   for(const n of await fsp.readdir(source)){if(modules.includes(n)||path.resolve(source,n)===path.resolve(elf))continue;await copyTree(path.join(source,n),path.join(app0,n));}
   await copyTree(tool.libs,path.join(dest,'libs'));
   set(id,{message:'Converting with AnyPS5 for this Intel PC…'});
   const exe=path.join(dest,'game.exe');
   const result=await child(relinker,['--windows',...(tool.intel?['--to-intel']:[]),'--registry',path.resolve(elf),exe],dest,log);
   if(result.code!==0)throw Error(`AnyPS5 conversion failed (${result.signal||'exit '+result.code}). Open the conversion log.`);
   await checkExe(exe);set(id,{exe,source:'AnyPS5',lastExit:null,message:'Conversion succeeded. Ready for a launch attempt; compatibility is unverified.'});
  }catch(e){set(id,{message:e.message});throw e;}finally{busy.delete(id);}
  return info(id);
 }
 return {info,attach,launch,prepare,hasRunning:()=>running.size>0||busy.size>0,logFile:id=>records[safeId(id)]?.log};
}
module.exports={createLauncher,safeId,checkExe};
