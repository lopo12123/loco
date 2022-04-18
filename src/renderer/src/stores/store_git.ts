import { LogResult, StatusResult } from "simple-git";

type StatusInfo = Omit<StatusResult, 'isClean'> | null

/**
 * @description sync store using sessionStorage
 */
class Store_git {
    // region git version (to check if command 'git' is available)
    useGitVersion(): string | null
    useGitVersion(val: string): void
    useGitVersion(val?: string): string | null | void {
        if(val !== undefined) {
            val === null
                ? localStorage.removeItem('git-version')
                : localStorage.setItem('git-version', val)
        }
        else {
            try {
                return localStorage.getItem('git-version') as string
            }
            catch (e) {
                return null
            }
        }
    }

    // endregion

    // region basedir (absolute path of .git)
    useBaseDir(): string | null
    useBaseDir(val: string | null): void
    useBaseDir(val?: string | null): string | null | void {
        if(val !== undefined) {
            val === null
                ? sessionStorage.removeItem('base-dir')
                : sessionStorage.setItem('base-dir', JSON.stringify(val))
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
    useLogInfo(): LogResult | null
    useLogInfo(val: LogResult | null): void
    useLogInfo(val?: LogResult | null): LogResult | null | void {
        if(val !== undefined) {
            val === null
                ? sessionStorage.removeItem('log-info')
                : sessionStorage.setItem('log-info', JSON.stringify(val))
        }
        else {
            try {
                return JSON.parse(sessionStorage.getItem('log-info')!) as LogResult
            }
            catch (e) {
                return null
            }
        }
    }

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