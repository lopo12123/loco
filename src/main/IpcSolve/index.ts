import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { exec } from "child_process";
import { join as joinPath, resolve as resolvePath } from "path";
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
            if(err) e.reply('browserReply', [ false, err.message ])
            else e.reply('browserReply', [ true, 'success' ])
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

    // region [git<Command>]
    ipcMain.on('gitBase', (e, { filePath }) => {
        useGit().base(filePath)
            .then((self) => {
                return Promise.all([ self.cmd_remote(), self.cmd_status() ])
            })
            .then(([ remoteInfo, statusInfo ]) => {
                e.reply('gitBaseReply', shakeFn([ true, { remoteInfo, statusInfo } ]))
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitBaseReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitClone', (e, { repoPath, localPath, filename }) => {
        useGit().cmd_clone(repoPath, localPath, filename)
            .then(() => {
                e.reply('gitCloneReply', [ true, 'success' ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitCommitReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitCommit', (e, { files, message }) => {
        useGit().cmd_commit(files, message)
            .then((res) => {
                e.reply('gitCommitReply', shakeFn([ true, res ]))
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitCommitReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitConfigEdit', (e) => {
        useGit().cmd_toplevel()
            .then((rootDir) => {
                exec(`notepad.exe ${ joinPath(rootDir, './.git/config') }`, (err) => {
                    if(err) e.reply('gitConfigEditReply', [ false, err.message ])
                    else e.reply('gitConfigEditReply', [ true, 'success' ])
                })
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitLogReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitDetect', (e) => {
        exec('git --version', (err, stdout) => {
            if(err) e.reply('gitDetectReply', [ false, err.message ])
            else e.reply('gitDetectReply', [ true, stdout.replace(/[\n]/g, '') ])
        })
    })
    ipcMain.on('gitIgnoreGet', (e) => {
        useGit().cmd_ignore()
            .then((fileStr) => {
                e.reply('gitIgnoreGetReply', [ true, fileStr ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitIgnoreGetReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitIgnoreSet', (e, { fileStr }) => {
        useGit().cmd_ignore_set(fileStr)
            .then(() => {
                e.reply('gitIgnoreSetReply', [ true, 'success' ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitIgnoreSetReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitInitDialog', (e) => {
        dialog
            .showOpenDialog({
                title: '选择git初始化位置',
                buttonLabel: '确认',
                properties: [ 'openDirectory' ]
            })
            .then((res) => {
                if(res.canceled || res.filePaths.length === 0) e.reply('gitInitDialogReply', [ true, 'cancel' ])
                else useGit()
                    .cmd_init(res.filePaths[0])
                    .then((res) => {
                        e.reply('gitInitDialogReply', shakeFn([ true, res ]))
                    })
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitLogReply', shakeFn([ false, err ]))
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
    ipcMain.on('gitPull', (e, { first, remoteName, remoteUrl }) => {
        useGit().cmd_pull(first, remoteName, remoteUrl)
            .then(() => {
                e.reply('gitPullReply', [ true, 'success' ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitPullReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitPush', (e, { first, remoteName, remoteUrl }) => {
        useGit().cmd_push(first, remoteName, remoteUrl)
            .then(() => {
                e.reply('gitPushReply', [ true, 'success' ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitPushReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitRemote', (e) => {
        useGit().cmd_remote()
            .then((res) => {
                e.reply('gitRemoteReply', [ true, res ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitRemoteReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitReset', (e, { hash }) => {
        useGit().cmd_reset(hash)
            .then((res) => {
                e.reply('gitResetReply', [ true, res ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitResetReply', shakeFn([ false, err ]))
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
    ipcMain.on('gitUserGet', (e) => {
        useGit().cmd_user()
            .then((userInfo) => {
                e.reply('gitUserGetReply', [ true, userInfo ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitUserGetReply', shakeFn([ false, err ]))
            })
    })
    ipcMain.on('gitUserSet', (e, { key, val }) => {
        useGit().cmd_user_set(key, val)
            .then(() => {
                e.reply('gitUserSetReply', [ true, 'success' ])
            })
            .catch((err) => {
                if(err instanceof Error) err = err.message
                else err = JSON.stringify(err)
                e.reply('gitUserSetReply', shakeFn([ false, err ]))
            })
    })
    // endregion
}

export {
    setIpc
}