import { app, BrowserWindow, ipcMain } from "electron";
import { exec } from "child_process";
import { resolve as resolvePath } from "path";
import { useGit } from "../GitLocal";

// region custom fn
/**
 * @description remove all the [function, symbol] param on origin object so that it can be send by ipc
 */
const shakeFn = <T>(ori: T): T => {
    return JSON.parse(JSON.stringify(ori))
}
// endregion

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
            default:
                console.log('Get invalid [type]: ' + type)
                break
        }
    })
    // endregion

    // region [browser]
    ipcMain.on('browser', (e, { urlToOpen }) => {
        exec(`start ${ urlToOpen }`, (err) => {
            if(err) e.reply('browserReply', [false, err.message])
            else e.reply('browserReply', [true, 'success'])
        })
    })
    // endregion

    // region [explorer]
    ipcMain.on('explorer', (e, { dirPath }) => {
        const dirToOpen = resolvePath(...dirPath)
        exec(`explorer /select, ${ dirToOpen }`, (err) => {
            if(err) e.reply('explorerReply', [ false, err.message ])
            else e.reply('explorerReply', [ true, 'success' ])
        })
    })
    // endregion

    // region [git<Command>] <Command>= 'Detect' | 'Init' | 'Log' | 'Status'
    ipcMain.on('gitDetect', (e) => {
        exec('git --version', (err, stdout) => {
            if(err) e.reply('gitDetectReply', [ false, err.message ])
            else e.reply('gitDetectReply', [ true, stdout.replace(/[\n]/g, '') ])
        })
    })
    ipcMain.on('gitInit', (e, { filePath }) => {
        useGit().init(filePath)
            .then((self) => {
                return Promise.all([ self.cmd_remote(), self.cmd_status() ])
            })
            .then(([ remoteInfo, statusInfo ]) => {
                e.reply('gitInitReply', shakeFn([ true, { remoteInfo, statusInfo } ]))
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitInitReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitLog', (e) => {
        useGit().cmd_log()
            .then((res) => {
                e.reply('gitLogReply', shakeFn([ true, res ]))
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitLogReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitStatus', (e) => {
        useGit().cmd_status()
            .then((res) => {
                e.reply('gitStatusReply', shakeFn([ true, res ]))
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitStatusReply', shakeFn([ false, err ]))
            })
    })
    // endregion
}

export {
    setIpc
}