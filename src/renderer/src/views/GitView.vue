<script lang="ts" setup>
import Dialog from "primevue/dialog";
import GitMarker from "../components/GitView/GitMarker.vue";
import Menu from "primevue/menu";
import { useGitStore } from "../stores/store_git";
import { useRouter } from "vue-router";
import { useToastStore } from "../stores/store_toast";
import { onBeforeMount, ref } from "vue";
import { useIpcRenderer } from "../stores/store_ipc";

const router = useRouter()
const baseDir = useGitStore().useBaseDir()
const remoteInfo = useGitStore().useRemoteInfo()
const statusInfoRef = ref(useGitStore().useStatusInfo())
const selectList = ref<boolean[]>(new Array(statusInfoRef.value?.files?.length ?? 0))

onBeforeMount(() => {
    if(!baseDir || !remoteInfo || !statusInfoRef.value) {
        useToastStore().warn('No git info available.')
        router.push({
            name: 'Starter'
        })
    }
})

/**
 * @description 在系统explorer中打开并选中
 * @description exec cmd: `explorer %path% /select`
 */
const openInExplorer = (type: 'base' | 'file', filePath: string) => {
    if(type === 'base') {
        useIpcRenderer().send('explorer', { dirPath: [ baseDir ] })
    }
    else {
        useIpcRenderer().send('explorer', { dirPath: [ baseDir, '..', filePath ] })
    }
}

/**
 * @description 获取最新的git信息
 */
const updateGitInfo = () => {
    useIpcRenderer().send('gitStatus')
    useIpcRenderer().once('gitStatusReply', (e, [ res, statusInfo ]) => {
        if(res) {
            useGitStore().useStatusInfo(statusInfo)
            statusInfoRef.value = statusInfo
            selectList.value = new Array(statusInfo.files.length).fill(false)
            useToastStore().success('status updated')
        }
        else {
            useToastStore().error(statusInfo)
        }
    })
}

/**
 * @description 下拉菜单
 * @description 包括 设置、历史、拉取、推送等
 */
const menuRef = ref<Menu | null>(null)
const menuItems = [
    {
        label: 'config',
        icon: 'iconfont icon-set',
        command() {
            router.push({
                name: 'ConfigView'
            })
        }
    },
    {
        label: 'history',
        icon: 'iconfont icon-commit',
        command() {
            router.push({
                name: 'CommitHistory'
            })
        }
    },
    {
        label: 'pull',
        icon: 'iconfont icon-jiantou_zuoxia',
        command() {
            console.log('do pull')
        }
    },
    {
        label: 'push',
        icon: 'iconfont icon-jiantou_youshang',
        command() {
            console.log('do push')
        }
    }
]
const toggleDropdown = (e: MouseEvent) => {
    menuRef.value?.toggle(e)
}

// region 执行 git commit
const commitExamples = [
    'feat: add a new feature of xxx',
    'fix: fix the bug of xxx',
    'docs: add documentation for xxx.',
    'refactor: refactor xxx',
    'style: modified the style of xxx',
    'test: add test of xxx',
    'chore: change build process or auxiliary tool'
]
const exampleIndex = ref(0)
const commitFiles = ref<string[]>([])
const commitMessage = ref('')
const commitDialogVisible = ref(false)

const doCommit = (type: 'show' | 'confirm') => {
    if(type === 'show') {
        const filesToCommit: string[] = []
        for (let i = 0; i < selectList.value.length; i++) {
            if(selectList.value[i]) {
                filesToCommit.push(statusInfoRef.value.files[i].path)
            }
        }
        if(filesToCommit.length === 0) useToastStore().warn('select at least one file to commit.')
        else {
            commitFiles.value = filesToCommit
            commitDialogVisible.value = true
        }
    }
    else if(type === 'confirm') {
        useIpcRenderer().send('gitCommit', JSON.parse(JSON.stringify({
            files: commitFiles.value,
            message: commitMessage.value
        })))
        useIpcRenderer().once('gitCommitReply', (e, [ res, commitInfo ]) => {
            if(res) {
                useToastStore().success('successful commit')
                commitDialogVisible.value = false
                updateGitInfo()
            }
            else {
                useToastStore().error(commitInfo)
            }
        })
    }
}
// endregion
</script>

<template>
    <div class="git-view" v-if="baseDir && remoteInfo && statusInfoRef">
        <Dialog class="commit-dialog" header=" " v-model:visible="commitDialogVisible">
            <div class="commit-dialog-content">
                <textarea v-model="commitMessage" placeholder="提交信息 (可选)"/>
                <div class="note">
                    <i>e.g. </i>
                    <span title="click to see another example"
                          @click="exampleIndex = (exampleIndex + 1) % 7">
                        {{ commitExamples[exampleIndex] }}
                    </span>
                </div>
            </div>
            <template #footer>
                <div class="commit-dialog-footer">
                    <div class="btn" @click="commitDialogVisible = false"><i>取消</i></div>
                    <div class="btn" @click="doCommit('confirm')"><i>确认</i></div>
                </div>
            </template>
        </Dialog>

        <div class="head">
            <div class="line path-block">
                <span class="h-key">根路径(root) </span>
                <span class="root-path" @click="openInExplorer('base', '')">{{ baseDir }}</span>
                <div class="op-btn">
                    <div class="btn" @click="toggleDropdown">
                        <i class="iconfont icon-diandiandian"/>
                    </div>
                    <Menu ref="menuRef" class="more-menu" :model="menuItems" :popup="true"/>
                </div>
            </div>
            <div class="line">
                <span class="h-key">远程(remote):</span>
                名称(name) <span class="h-val">{{ remoteInfo[0] === '' ? '暂无' : remoteInfo[0] }}</span>;
                地址(url) <span class="h-val">{{ remoteInfo[1] === '' ? '暂无' : remoteInfo[1] }}</span>
            </div>
            <div class="line">
                <span class="h-key">提交(commit):</span>
                [compare with remote]
                超前(ahead) <span class="h-val">{{ statusInfoRef.ahead }}</span> 条;
                滞后(behind) <span class="h-val">{{ statusInfoRef.behind }}</span> 条.
            </div>
            <div class="line">
                <span class="h-key">变更(changes):</span>
                共 <span class="h-val">{{ statusInfoRef.files.length }}</span> 项;
                新增(created) <span class="h-val">{{ statusInfoRef.created.length }}</span> 项;
                删除(deleted) <span class="h-val">{{ statusInfoRef.deleted.length }}</span> 项;
                修改(modified) <span class="h-val">{{ statusInfoRef.modified.length }}</span> 项;
                重命名(renamed) <span class="h-val">{{ statusInfoRef.renamed.length }}</span> 项.
            </div>
        </div>
        <div class="body">
            <div class="line table-header">
                <div class="select">-</div>
                <div class="index">序号</div>
                <div class="marker">类型</div>
                <div class="filename">文件</div>

                <div class="right-btns">
                    <div class="status-btn" title="获取最新状态"
                         @click="updateGitInfo">
                        <i class="iconfont icon-shuaxin"/>
                    </div>
                    <div class="status-btn" title="提交选中文件"
                         @click="doCommit('show')">
                        <i class="iconfont icon-check"/>
                    </div>
                </div>
            </div>
            <div class="line" v-for="(item, index) in statusInfoRef.files" :key="item.path">
                <div class="select">
                    <label>
                        <input type="checkbox" v-model="selectList[index]">
                    </label>
                </div>
                <div class="index">{{ index + 1 }}</div>
                <div class="marker">
                    <GitMarker :mark="item.index"/>
                    <GitMarker :mark="item.working_dir"/>
                </div>
                <div class="filename">
                    <span class="link" :title="item.path"
                          @click="openInExplorer('file', item.path)">
                        {{ item.path }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/mixin";

.git-view {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: cursive;
    user-select: none;

    .link {
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .head {
        position: relative;
        width: 100%;
        height: 130px;
        cursor: default;

        .path-block {
            .root-path {
                cursor: pointer;

                &:hover {
                    text-decoration: underline;
                }
            }

            .op-btn {
                position: absolute;
                z-index: 10;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: flex-end;

                .btn {
                    position: relative;
                    width: 30px;
                    height: 30px;
                    border-radius: 5px;
                    text-align: center;
                    line-height: 30px;
                    cursor: pointer;
                    pointer-events: auto;

                    &:hover {
                        background-color: #cccccc1a;
                    }
                }
            }
        }

        .line {
            @include mixin.doScrollbar(#777777, 2px);
            position: relative;
            width: 100%;
            height: 30px;
            line-height: 30px;
            white-space: nowrap;
            overflow: auto hidden;

            .h-key {
                position: sticky;
                left: 0;
                color: khaki;
                background-color: #2f3241;
            }

            .h-val {
                color: #9feaf9;
            }
        }
    }

    .body {
        @include mixin.doScrollbar(#777777, 4px);
        position: relative;
        width: 100%;
        height: calc(100% - 130px);
        overflow: hidden auto;

        .line {
            position: relative;
            width: 100%;
            height: 30px;
            background-color: #2f3241;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .select {
                width: 20px;

                label {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    display: block;

                    input {
                        position: relative;
                        width: 10px;
                        height: 10px;
                        cursor: pointer;
                    }
                }
            }

            .index {
                width: 60px;
            }

            .marker {
                width: 60px;
            }

            .filename {
                @include mixin.doScrollbar(#777777, 2px);
                width: calc(100% - 140px);
                white-space: nowrap;
                overflow: auto hidden;
            }
        }

        .table-header {
            position: sticky;
            top: 0;
            z-index: 10;

            .right-btns {
                position: absolute;
                right: 0;
                width: fit-content;
                display: flex;
                align-items: center;
                .status-btn {
                    position: relative;
                    width: 30px;
                    height: 30px;
                    border-radius: 5px;
                    text-align: center;
                    line-height: 30px;
                    cursor: pointer;
                    pointer-events: auto;

                    &:hover {
                        background-color: #cccccc1a;
                    }

                    i {
                        font-size: 12px;
                    }
                }
            }
        }
    }
}

.commit-dialog {
    box-sizing: content-box;

    .commit-dialog-content {
        width: 260px;
        height: 80px;
        background-color: #2f3241;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        overflow: hidden;

        textarea {
            width: 100%;
            height: 60px;
            padding: 5px;
            background-color: #1b1e2d;
            outline: none;
            color: #9feaf9;
            resize: none;
        }

        .note {
            width: 100%;
            height: 20px;
            color: #86a5b1cc;
            font-size: 12px;
            user-select: none;

            span {
                cursor: pointer;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }

    .commit-dialog-footer {
        position: relative;
        width: 260px;
        background-color: #2f3241;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .btn {
            position: relative;
            height: 20px;
            margin: 0 5px;
            line-height: 20px;
            cursor: pointer;

            &:hover {
                color: #9feaf9;
                text-decoration: underline;
            }
        }
    }
}
</style>
