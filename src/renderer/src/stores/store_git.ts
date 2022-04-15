import { StatusResult } from "simple-git";

type StatusInfo = Omit<StatusResult, 'isClean'> | null
type LogInfo = Omit<StatusResult, 'isClean'> | null

/**
 * @description sync store using sessionStorage
 */
class Store_git {
    // region basedir
    useBaseDir(): string | null
    useBaseDir(dir: string | null): void
    useBaseDir(dir?: string | null): string | null | void {
        if(dir !== undefined) {
            dir === null
                ? sessionStorage.removeItem('base-dir')
                : sessionStorage.setItem('base-dir', JSON.stringify(dir))
        }
    }

    // endregion

    // region log
    #logInfo: LogInfo = null
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
                return JSON.parse(sessionStorage.getItem('status-info') ?? '') as StatusInfo
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