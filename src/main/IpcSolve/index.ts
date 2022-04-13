import { BrowserWindow, ipcMain } from "electron";
import { Channel, CB_Main } from "./declare";

/**
 * @description set all event of ipcMain
 * @param winRef
 */
const setIpc = (winRef: BrowserWindow | null) => {
    ipcMain.on(Channel.banner, ((e, args) => {

    }) as (CB_Main[Channel.banner]))
}

export {
    setIpc
}