import simpleGit, { SimpleGit, StatusResult } from "simple-git";
import { join, resolve } from "path";

class Git {
    #git: SimpleGit | null = null

    init(path: string) {
        path = resolve(path)
        if(path.endsWith('.git')) path = join(path, '..')
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

    cmd_log() {
        return new Promise((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.log([], (err, data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    cmd_status() {
        return new Promise<StatusResult>((resolve, reject) => {
            if(!this.#git) reject('Git has not been initialized.')
            else this.#git.status((err, data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }
}

const _ = new Git()
export const useGit = () => _

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