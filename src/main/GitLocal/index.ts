import simpleGit, {
    CommitResult,
    InitResult,
    LogResult,
    PullResult,
    PushResult,
    SimpleGit,
    StatusResult
} from "simple-git";
import { join as joinPath, resolve as resolvePath } from "path";
import { readFileSync, writeFileSync } from "fs";

class Git {
    #git: SimpleGit | null = null

    base(path: string): Promise<Git> {
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
        return new Promise<CommitResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                if(!msg) msg = 'system: No commit message'
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

    cmd_ignore(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                this.cmd_toplevel()
                    .then((rootDir) => {
                        const fileStr = readFileSync(joinPath(rootDir, './.gitignore'), { encoding: 'utf-8' })
                        resolve(fileStr)
                    })
                    .catch((err) => {
                        // 'ENOENT' (error no entry) means no such file
                        if(err.code === 'ENOENT') resolve('')
                        // other error
                        else reject(err)
                    })
            }
        })
    }

    cmd_ignore_set(val: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                this.cmd_toplevel()
                    .then((rootDir) => {
                        writeFileSync(joinPath(rootDir, './.gitignore'), val, { encoding: 'utf-8' })
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    }

    cmd_init(rootDir: string): Promise<InitResult> {
        return new Promise<InitResult>((resolve, reject) => {
            simpleGit().init([ '--initial-branch=master', resolvePath(rootDir) ], (err, res) => {
                if(err) reject(err)
                else {
                    this.#git = simpleGit(rootDir)
                    resolve(res)
                }
            })
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

    cmd_pull(): Promise<PullResult> {
        return new Promise<PullResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.pull((err, res) => {
                err ? reject(err) : resolve(res)
            })
        })
    }

    cmd_push(): Promise<PushResult> {
        return new Promise<PushResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.push((err, res) => {
                err ? reject(err) : resolve(res)
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
                            remoteName = res.split('\n')[0] ?? ''
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

    cmd_remote_set(name: string, url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                this.#git
                    .remote([])
                    .then((remoteNames) => {
                        if(!remoteNames || !remoteNames.includes(name)) {
                            return this.#git!.remote([ 'add', name, url ])
                        }
                        else {
                            return this.#git!.remote([ 'set-url', name, url ])
                        }
                    })
                    .then(() => {
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    }

    cmd_reset(hash: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.reset([ '--hard', hash ], (err, stdout) => {
                err ? reject(err) : resolve(stdout.replace(/[\n]/g, ''))
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

    cmd_toplevel(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.revparse([ '--show-toplevel' ], (err, data) => {
                err ? reject(err) : resolve(data.replace(/[\n]/g, ''))
            })
        })
    }

    cmd_user(): Promise<{ name: string, email: string }> {
        return new Promise<{ name: string, email: string }>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                const mergedRes: { name: string, email: string } = { name: '', email: '' }
                this.#git.getConfig('user.name')
                    .then((user_name) => {
                        mergedRes.name = user_name.value ?? ''
                        return this.#git!.getConfig('user.email')
                    })
                    .then((user_email) => {
                        mergedRes.email = user_email.value ?? ''
                        resolve(mergedRes)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    }

    cmd_user_set(key: 'name' | 'email', val: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else {
                this.#git
                    .addConfig(`user.${ key }`, val)
                    .then(() => {
                        resolve()
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

// _.cmd_init('D:\\GitProjects\\pool\\noGit')
//     .then((res) => {
//         console.log('res: ', res)
//         return _.cmd_toplevel()
//     })
//     .then((top) => {
//         console.log('top: ', top)
//     })
//     .catch((err) => {
//         console.log('err: ', err)
//     })

// _.base('D:\\GitProjects\\pool\\noGit\\123')
//     .then((self) => {
//         return self.cmd_toplevel()
//     })
//     .then((res) => {
//         console.log(res)
//     })
//     .catch((err) => {
//         console.log(err)
//     })

// test: reset
// _.base('D:\\GitProjects\\pool\\noGit')
//     .then((self) => {
//         return self.cmd_reset('5af911b')
//     })
//     .then((res) => {
//         console.log(res)
//     })
//     .catch((err) => {
//         console.log(err)
//     })

// test: remote
// console.time('remote')
// _.base('.')
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
// _.base('D:\\GitProjects\\git-loco\\.git')
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
// _.base("D:\\GitProjects\\loco\\.git")
//     .then((self) => {
//         return self.cmd_status()
//     })
//     .then((res) => {
//         console.log(res)
//     })
//     .catch((e) => {
//         console.log(e)
//     })