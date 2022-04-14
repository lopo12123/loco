import { ElectronAPI } from '@electron-toolkit/preload'
import { CB_Renderer } from "./declare"

declare global {
    interface Window {
        electron: ElectronAPI
        ipc: CB_Renderer
    }
}
