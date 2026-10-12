// SPDX-License-Identifier: GPL-3.0-or-later
const {app,BrowserWindow,Menu,session,ipcMain,dialog,shell}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
const {createLauncher,safeId}=require('./launcher.cjs');
const {createToolchainStore}=require('./toolchain.cjs');
app.setName('Portlight Desktop');
app.setPath('userData',path.join(app.getPath('appData'),'Portlight Desktop'));
app.commandLine.appendSwitch('log-file',path.join(app.getPath('userData'),'chromium.log'));
let main;
if(!app.requestSingleInstanceLock())app.quit();
else {
 app.on('second-instance',()=>{if(main){if(main.isMinimized())main.restore();main.show();main.focus();}});
 app.whenReady().then(()=>{
  const store=createToolchainStore(app.getPath('userData'));
  const reports=JSON.parse(fs.readFileSync(path.join(__dirname,'catalog','test-results.json'),'utf8'));
  const launcher=createLauncher({dataDir:path.join(app.getPath('userData'),'games'),getToolchain:async()=>{const t=store.get();if(!t)throw Error('Configure AnyPS5 first.');return t;}});
  main=new BrowserWindow({width:1440,height:940,minWidth:960,minHeight:640,backgroundColor:'#0d0d0f',title:'Portlight Desktop',show:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}});
  const entry=pathToFileURL(path.join(__dirname,'dist','index.html')).href;
  function guard(event,id){if(event.sender!==main.webContents||event.senderFrame!==main.webContents.mainFrame||event.senderFrame.url.split('#')[0].toLowerCase()!==entry.toLowerCase())throw Error('Untrusted launcher request.');if(id!==undefined)safeId(id);}
  session.defaultSession.setPermissionRequestHandler((_w,_p,done)=>done(false));
  session.defaultSession.setPermissionCheckHandler(()=>false);
  session.defaultSession.webRequest.onHeadersReceived((d,done)=>done({responseHeaders:{...d.responseHeaders,'Content-Security-Policy':["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-src 'none'"]}}));
  main.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  main.webContents.on('will-navigate',(e,url)=>{if(url.split('#')[0].toLowerCase()!==entry.toLowerCase())e.preventDefault();});
  main.webContents.on('will-attach-webview',e=>e.preventDefault());
  let configuring=false;
  const toolStatus=()=>({configured:Boolean(store.get()),relinker:store.get()?.relinker||''});
  async function configure(){
   if(configuring)throw Error('AnyPS5 configuration is already open.');configuring=true;
   try{
    const exe=await dialog.showOpenDialog(main,{title:'Select your AnyPS5 relinker executable',properties:['openFile'],filters:[{name:'AnyPS5 Windows executable',extensions:['exe']}]});
    if(exe.canceled)return toolStatus();
    const libs=await dialog.showOpenDialog(main,{title:'Select matching AnyPS5 runtime libs folder (.prx files)',properties:['openDirectory']});
    if(libs.canceled)return toolStatus();
    await store.save(exe.filePaths[0],libs.filePaths[0],os.cpus().some(c=>/Intel/i.test(c.model)));
    return toolStatus();
   }finally{configuring=false;}
  }
  const picking=new Set();
  async function pick(id,kind){
   if(picking.has(id))throw Error('A file picker is already open.');picking.add(id);
   try{
    if(kind==='prepare'&&!store.get()){await configure();if(!store.get())return launcher.info(id);}
    const r=await dialog.showOpenDialog(main,{title:kind==='attach'?'Select a prepared Windows game executable':'Select a clean ELF beside its game resources',properties:['openFile'],filters:[kind==='attach'?{name:'Windows executable',extensions:['exe']}:{name:'ELF executable',extensions:['elf','bin']}]});
    if(r.canceled)return launcher.info(id);
    return await launcher[kind](id,r.filePaths[0]);
   }finally{picking.delete(id);}
  }
  ipcMain.handle('local:status',(e,id)=>{guard(e,id);const h=reports[id];return {...launcher.info(id),homebrew:h?{status:h.status,message:h.message,downloaded:false,bytes:0}:null};});
  ipcMain.handle('local:toolchain',e=>{guard(e);return toolStatus();});
  ipcMain.handle('local:configure',e=>{guard(e);return configure();});
  ipcMain.handle('local:attach',(e,id)=>{guard(e,id);return pick(id,'attach');});
  ipcMain.handle('local:prepare',(e,id)=>{guard(e,id);return pick(id,'prepare');});
  ipcMain.handle('local:launch',async(e,id)=>{guard(e,id);if(!launcher.info(id).attached){await pick(id,'prepare');if(!launcher.info(id).attached)return launcher.info(id);}return launcher.launch(id);});
  ipcMain.handle('local:log',async(e,id)=>{guard(e,id);const file=launcher.logFile(id);if(file){const error=await shell.openPath(file);if(error)throw Error(error);}});
  ipcMain.handle('local:source',async(e,id)=>{guard(e,id);const url=reports[id]?.source;if(url&&/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(url))await shell.openExternal(url);});
  main.on('close',e=>{if(launcher.hasRunning()&&dialog.showMessageBoxSync(main,{type:'question',buttons:['Keep app open','Close launcher'],defaultId:0,cancelId:0,message:'A game or conversion is running.',detail:'Keep Portlight open to retain process status and exit logs. Closing the launcher does not stop games.'})===0)e.preventDefault();});
  Menu.setApplicationMenu(Menu.buildFromTemplate([
   {label:'Portlight',submenu:[{label:'About and credits',click:()=>dialog.showMessageBox(main,{title:'Portlight Desktop',message:'Portlight Desktop 0.1.0-alpha.1',detail:'Unofficial Windows integration.\n\nOverdrive — created by overdriveps5 and PS5 React contributors.\nhttps://github.com/overdriveps5/game-store\n\nAnyPS5 — boykopovar and contributors; separately installed executable-porting tools (GPL-2.0-only).\nhttps://github.com/boykopovar/AnyPS5\n\nPortlight modifications: GPL-3.0-or-later. Complete credits and notices are included in the download. No upstream or Sony endorsement is implied.'})},{role:'quit'}]},
   {label:'Tools',submenu:[{label:'Configure AnyPS5…',click:()=>configure().catch(e=>dialog.showErrorBox('AnyPS5 configuration',e.message))},{label:'Open app data',click:()=>shell.openPath(app.getPath('userData'))}]},
   {label:'View',submenu:[{role:'reload'},{role:'togglefullscreen'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}]},
   {label:'Edit',submenu:[{role:'copy'},{role:'paste'},{role:'selectAll'}]}
  ]));
  main.once('ready-to-show',()=>main.show());main.loadFile(path.join(__dirname,'dist','index.html'));
 });
 app.on('window-all-closed',()=>app.quit());
}
