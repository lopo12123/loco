import { app, BrowserWindow, ipcMain } from "electron";

/**
 * @description set all event of ipcMain
 * @param winRef
 */
const setIpc = (winRef: BrowserWindow | null) => {
    if(!winRef) return;

    // region [channel: banner]
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

    // region [channel: git]
    ipcMain.on('git', (e, args) => {

    })
    // endregion
}

export {
    setIpc
}