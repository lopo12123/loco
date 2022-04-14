import { ElectronAPI } from '@electron-toolkit/preload'
import { Ipc } from "../../preload";

declare global {
    interface Window {
        electron: ElectronAPI
        ipc: Ipc
    }
}
