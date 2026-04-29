const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('onlookDesktop', {
    platform: process.platform,
    version: ipcRenderer.sendSync('onlook:get-version'),
});
