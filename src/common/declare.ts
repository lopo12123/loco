import { IpcMainEvent } from "electron"

// region all channel
/**
 * @description channel for ipcMain
 */
enum Channel {
    'banner' = 'banner'
}

// endregion

// region misc
type BannerEvType = 'min' | 'refresh' | 'max' | 'close'
// endregion

// region ipcMain
interface CB_Main {
    [Channel.banner]: (e: IpcMainEvent, args: { type: Exclude<BannerEvType, 'refresh'> }) => void
}

// endregion

// region ipcRenderer
interface CB_Renderer {
    [Channel.banner]: (type: Exclude<BannerEvType, 'refresh'>) => void
}

// endregion

export {
    Channel
}

export type {
    CB_Main, CB_Renderer
}