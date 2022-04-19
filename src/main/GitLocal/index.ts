import simpleGit, { CommitResult, LogResult, SimpleGit, StatusResult } from "simple-git";
import { join as joinPath, resolve as resolvePath } from "path";

class Git {
    #git: SimpleGit | null = null

    init(path: string) {
        path = resolvePath(path)
        if(path.endsWith('.git')) path = joinPath(path, '..')
        return new Promise<Git>((resolve, reject) => {
            this.#git = simpleGit(path)
            this.#git.checkIsRepo((err, ifRepo) => {
                if(err) reject(err)
                else if(ifRepo) resolve(this)
                else {
                    this.#git = null
                    reject('Not a git repository (or any of the parent directories).')
                }
            })
        })
    }

    cmd_commit(files: string[], msg: string): Promise<CommitResult> {
        if(!msg) msg = 'system: This message is automatically added when the user does not enter commit information.'

        return new Promise<CommitResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                this.#git.add(files, (err_add) => {
                    if(err_add) reject(err_add)
                    else {
                        this.#git!.commit(msg, files, (err_commit, data) => {
                            if(err_commit) reject(err_commit)
                            else resolve(data)
                        })
                    }
                })
            }
        })
    }

    cmd_log(): Promise<LogResult> {
        return new Promise<LogResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.log([], (err, data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    cmd_status(): Promise<StatusResult> {
        return new Promise<StatusResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.status((err, data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    cmd_remote(): Promise<[ string, string ]> {
        return new Promise<[ string, string ]>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                let remoteName = ''
                this.#git
                    .remote([])
                    .then((res) => {
                        if(!res) {
                            return Promise.resolve('')
                        }
                        else {
                            remoteName = res.replace(/[\n ]/g, '')
                            return this.#git!.remote([ 'get-url', remoteName ])
                        }
                    })
                    .then((remoteUrl) => {
                        if(!remoteUrl) resolve([ remoteName, '' ])
                        else resolve([ remoteName, remoteUrl.replace(/[\n ]/g, '') ])
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    }
}

const _ = new Git()
export const useGit = () => _

_.init('D:\\GitProjects\\pool\\noGit')
    .then((self) => {
        console.time('cmt')
        return self.cmd_commit(['a.txt'], 'msg1')
    })
    .then((res) => {
        console.log(res)
        console.timeEnd('cmt')
    })
    .catch((err) => {
        console.log(err)
        console.timeEnd('cmt')
    })

// test: remote
// console.time('remote')
// _.init('.')
//     .then((self) => {
//         return self.cmd_remote()
//     })
//     .then((res) => {
//         // console.timeEnd('remote')
//         console.log(res, typeof res, '[' + res + ']')
//
//         const str = ""
//     })
//     .catch((err) => {
//         console.log(err)
//     })

// test: log
// console.time('log')
// _.init('D:\\GitProjects\\git-loco\\.git')
//     .then((self) => {
//         return self.cmd_log()
//     })
//     .then((res) => {
//         console.timeEnd('log')
//         console.log(res)
//     })
//     .catch((e) => {
//         console.log(e)
//     })

// test: status
// _.init("D:\\GitProjects\\loco\\.git")
//     .then((self) => {
//         return self.cmd_status()
//     })
//     .then((res) => {
//         console.log(res)
//     })
//     .catch((e) => {
//         console.log(e)
//     })