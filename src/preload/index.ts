import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { CB_Renderer } from "../common/declare";

// Custom APIs for renderer

const ipc: CB_Renderer = {
    banner: (type) => {
        ipcRenderer.send('banner', { type })
    }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if(process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('ipc', ipc)
    }
    catch (error) {
        console.error(error)
    }
}
else {
    window.electron = electronAPI
    window.ipc = ipc
}
