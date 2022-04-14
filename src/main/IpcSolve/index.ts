import { app, BrowserWindow, ipcMain } from "electron";
import { Channel, CB_Main } from "../../common/declare";

/**
 * @description set all event of ipcMain
 * @param winRef
 */
const setIpc = (winRef: BrowserWindow | null) => {
    if(!winRef) return;

    /**
     * @description AppBanner上的按钮事件
     */
    ipcMain.on(Channel.banner, ((e, { type }) => {
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
    }) as CB_Main[Channel.banner])
}

export {
    setIpc
}