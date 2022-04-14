import { app, BrowserWindow, ipcMain } from "electron";
import { useGit } from "../GitLocal";
import { join } from "path";

/**
 * @description set all event of ipcMain
 * @param winRef
 */
const setIpc = (winRef: BrowserWindow | null) => {
    if(!winRef) return;

    // region [banner]
    /**
     * @description AppBanner上的按钮事件
     */
    ipcMain.on('banner', (e, { type }) => {
        switch(type) {
            case 'min':
                winRef?.minimize()
                break
            case 'max':
                winRef?.isMaximized() ? winRef?.unmaximize() : winRef?.maximize()
                break
            case 'close':
                // `win.close()` is disabled while `frame=false`
                winRef = null
                app.exit()
                break
        }
    })
    // endregion

    // region [git:<command>] <command>= 'base' | 'log' | 'status'
    ipcMain.on('git:base', (e, { filePath }) => {
        useGit().init(filePath)
            .then((self) => {
                return self.cmd_status()
            })
            .then((res) => {
                e.reply('git:base-reply', [ true, res ])
            })
            .catch((err) => {
                e.reply('git:base-reply', [ false, err ])
            })
    })
    ipcMain.on('git:log', (e, args) => {

    })
    ipcMain.on('git:status', (e, args) => {

    })
    // endregion
}

export {
    setIpc
}