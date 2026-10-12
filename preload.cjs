// SPDX-License-Identifier: GPL-3.0-or-later
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('overdriveLocal',{
 status:id=>ipcRenderer.invoke('local:status',id),attach:id=>ipcRenderer.invoke('local:attach',id),
 prepare:id=>ipcRenderer.invoke('local:prepare',id),launch:id=>ipcRenderer.invoke('local:launch',id),
 log:id=>ipcRenderer.invoke('local:log',id),source:id=>ipcRenderer.invoke('local:source',id),
 toolchain:()=>ipcRenderer.invoke('local:toolchain'),configure:()=>ipcRenderer.invoke('local:configure')
});
