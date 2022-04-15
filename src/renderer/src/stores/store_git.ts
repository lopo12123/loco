import { StatusResult } from "simple-git";

type StatusInfo = Omit<StatusResult, 'isClean'> | null
type LogInfo = Omit<StatusResult, 'isClean'> | null

/**
 * @description sync store using sessionStorage
 */
class Store_git {
    // region basedir (absolute path of .git)
    useBaseDir(): string | null
    useBaseDir(dir: string | null): void
    useBaseDir(dir?: string | null): string | null | void {
        if(dir !== undefined) {
            dir === null
                ? sessionStorage.removeItem('base-dir')
                : sessionStorage.setItem('base-dir', JSON.stringify(dir))
        }
        else {
            try {
                return JSON.parse(sessionStorage.getItem('base-dir')!) as string
            }
            catch (e) {
                return null
            }
        }
    }

    // endregion

    // region log

    // endregion

    // region remote
    useRemoteInfo(): [ string, string ] | null
    useRemoteInfo(val: [ string, string ]): void
    useRemoteInfo(val?: [ string, string ]): [ string, string ] | null | void {
        // val: [remoteName, remoteUrl]
        if(val !== undefined) {
            val === null
                ? sessionStorage.removeItem('remote-info')
                : sessionStorage.setItem('remote-info', JSON.stringify(val))
        }
        else {
            try {
                return JSON.parse(sessionStorage.getItem('remote-info')!) as [ string, string ]
            }
            catch (e) {
                return null
            }
        }
    }

    // endregion

    // region status
    useStatusInfo(): StatusInfo
    useStatusInfo(val: StatusInfo): void
    useStatusInfo(val?: StatusInfo): StatusInfo | void {
        if(val !== undefined) {
            val === null
                ? sessionStorage.removeItem('status-info')
                : sessionStorage.setItem('status-info', JSON.stringify(val))
        }
        else {
            try {
                return JSON.parse(sessionStorage.getItem('status-info')!) as StatusInfo
            }
            catch (e) {
                return null
            }
        }
    }

    // endregion

}

const _ = new Store_git()

export const useGitStore = () => _