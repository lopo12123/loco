import { ElectronAPI } from '@electron-toolkit/preload'
import { Ipc } from "./index"

declare global {
    interface Window {
        electron: ElectronAPI
        ipc: Ipc
    }
}
