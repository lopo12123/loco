import { BrowserWindow, ipcMain } from "electron";

/**
 * @description channel for ipcMain
 */
enum Channel {
    'banner' = 'banner'
}

/**
 * @description set all event of ipcMain
 * @param winRef
 */
const setIpc = (winRef: BrowserWindow | null) => {
    ipcMain.on(Channel.banner, (e, args) => {

    })
}

export {
    setIpc
}