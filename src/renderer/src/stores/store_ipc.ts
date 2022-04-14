import { IpcRenderer } from "@electron-toolkit/preload";

const useIpcRenderer = (): IpcRenderer => window.electron.ipcRenderer

export {
    useIpcRenderer,
}