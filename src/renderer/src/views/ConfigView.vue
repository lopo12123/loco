<script lang="ts" setup>
import { useRouter } from "vue-router";
import Dialog from "primevue/dialog";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";
import { onBeforeMount, ref } from "vue";
import { useGitStore } from "../stores/store_git";
import ClickToEdit from "../components/Misc/ClickToEdit.vue";

const router = useRouter()

onBeforeMount(() => {
    if(remoteInfo.value === null) remoteInfo.value = [ '', '' ]
    if(userInfo.value === null) userInfo.value = { name: '', email: '' }

    updateAllConfig()
})

/**
 * @description 发送ipc, 使用系统记事本打开config文件
 */
const openInNotepad = () => {
    useIpcRenderer().send('gitConfigEdit')
    useIpcRenderer().once('gitConfigEditReply', (e, [ res, msg ]) => {
        if(!res) useToastStore().error(msg)
    })
}

/**
 * @description 重新获取所有信息
 */
const updateAllConfig = () => {
    updateRemote('get', false)
    updateUser('get', '', false)
    updateIgnore('get', false)
}

// region remote
const remoteInfo = ref<[ string, string ]>(useGitStore().useRemoteInfo())
const remoteUrlToSet = ref('')
const remoteOperateType = ref<'add' | 'set-url'>('add')
const remoteDialogVisible = ref(false)
const updateRemote = (type: 'get' | 'set', toast: boolean = true) => {
    if(type === 'get') {
        useIpcRenderer().send('gitRemoteGet')
        useIpcRenderer().once('gitRemoteGetReply', (e, [ res, msg ]) => {
            if(res) {
                remoteInfo.value = msg
                useGitStore().useRemoteInfo(msg)
                toast ? useToastStore().success('reread remote config') : ''
            }
            else {
                useToastStore().error(msg)
            }
        })
    }
    else if(type === 'set') {
        const newUrl = remoteUrlToSet.value
        if((!newUrl.startsWith('https://') && !newUrl.startsWith('git@')) || (!newUrl.endsWith('.git'))) {
            useToastStore().warn('invalid url.')
        }
        else {
            const newName = remoteInfo.value[0] === '' ? 'origin' : remoteInfo.value[0]
            const newUrl = remoteUrlToSet.value
            remoteDialogVisible.value = false

            useIpcRenderer().send('gitRemoteSet', { name: newName, url: newUrl })
            useIpcRenderer().once('gitRemoteSetReply', (e, [ res, msg ]) => {
                if(res) {
                    remoteInfo.value = [ newName, newUrl ]
                    useGitStore().useRemoteInfo([ newName, newUrl ])
                    useToastStore().success('remote config updated')
                }
                else {
                    useToastStore().error(msg)
                }
            })
        }
    }
}
// endregion

// region user
const userInfo = ref<{ name: string, email: string } | null>(useGitStore().useUserInfo())
const updateUser = (type: 'get' | 'name' | 'email', val: string, toast: boolean = true) => {
    if(type === 'get') {
        useIpcRenderer().send('gitUserGet')
        useIpcRenderer().once('gitUserGetReply', (e, [ res, info ]) => {
            if(res) {
                userInfo.value = info
                useGitStore().useUserInfo(info)
                toast ? useToastStore().success('reread user config') : ''
            }
            else {
                useToastStore().error(info)
            }
        })
    }
    else {
        useIpcRenderer().send('gitUserSet', { key: type, val: val })
        useIpcRenderer().once('gitUserSetReply', (e, [ res, msg ]) => {
            if(res) {
                userInfo.value = {
                    ...userInfo.value,
                    [type]: val
                }
                useGitStore().useUserInfo(userInfo.value)
                useToastStore().success(`user.${ type } updated`)
            }
            else {
                useToastStore().error(msg)
            }
        })
    }
}
// endregion

// region ignore
const ignoreInfo = ref(useGitStore().useIgnoreInfo())
const ignoreDialogVisible = ref(false)
const ignoreRules: string[] = [
    '每一行指定一条忽略规则',
    '以井号"#"开头表示注释',
    '以斜杠"/"开头表示目录',
    '以星号"*"通配多个字符',
    '以两个星号"**"通配多级目录',
    '以问号通配单个字符',
    '以方括号"[]"包含单个字符的匹配列表',
    '以叹号"!"表示不忽略匹配到的文件或目录',
    '对.gitignore配置文件按行从上到下进行规则匹配'
]
const ignoreExamples: { rule: string, mean: string }[] = [
    { rule: 'bin/', mean: '忽略当前路径下的bin文件, 该文件下的所有内容都会忽略(但不包含bin文件本身)' },
    { rule: '/bin', mean: '忽略根路径下的bin文件' },
    { rule: '/*.doc', mean: '忽略根路径下的子文件后缀为doc的文件(cat.doc被忽略, 但不会忽略lib/cat.doc文件)' },
    { rule: '*.doc', mean: '忽略所有的后缀为doc的文件' },
    { rule: '**/animal', mean: '忽略任意层级下的animal文件' },
    { rule: '!cat.doc', mean: '不忽略当前目录下的cat.doc文件' }
]
const ignoreFileStrToSet = ref('')
const ifEditIgnore = ref(false)
const updateIgnore = (type: 'get' | 'set', toast: boolean = true) => {
    if(type === 'get') {
        useIpcRenderer().send('gitIgnoreGet')
        useIpcRenderer().once('gitIgnoreGetReply', (e, [ res, fileStr ]) => {
            if(res) {
                ignoreInfo.value = fileStr
                ignoreFileStrToSet.value = fileStr
                useGitStore().useIgnoreInfo(fileStr)
                toast ? useToastStore().success('reread ignore config') : ''
            }
            else {
                useToastStore().error(fileStr)
            }
        })
    }
    else if(type === 'set') {
        ifEditIgnore.value = false
        useIpcRenderer().send('gitIgnoreSet', { fileStr: ignoreFileStrToSet.value })
        useIpcRenderer().once('gitIgnoreSetReply', (e, [ res, msg ]) => {
            if(res) {
                ignoreInfo.value = ignoreFileStrToSet.value
                useGitStore().useIgnoreInfo(ignoreInfo.value)
                useToastStore().success('ignore config updated')
            }
            else {
                useToastStore().error(msg)
            }
        })
    }
}
// endregion

/**
 * @description 返回 git-view 页面
 */
const back = () => {
    router.push({
        name: 'GitView'
    })
}
</script>

<template>
    <div class="config-view">
        <Dialog class="remote-dialog" header="定义远程" v-model:visible="remoteDialogVisible">
            <div class="remote-dialog-content">
                <div class="remote-name"><span style="color: #9feaf9">名称: </span><span
                    class="remote-name-val">{{ remoteInfo[0] === '' ? 'origin' : remoteInfo[0] }}</span></div>
                <div class="remote-url" style="color: #9feaf9">url:</div>
                <input class="remote-url-ipt" v-model="remoteUrlToSet"
                       type="text" placeholder="请输入远程url" spellcheck="false">
            </div>
            <template #footer>
                <div class="remote-dialog-footer">
                    <div class="btn" @click="remoteDialogVisible = false"><i>取消</i></div>
                    <div class="btn" @click="updateRemote('set')"><i>确认</i></div>
                </div>
            </template>
        </Dialog>

        <Dialog class="ignore-dialog" header="ignore规则/示例" v-model:visible="ignoreDialogVisible">
            <div class="ignore-dialog-content">
                <span style="color: khaki">规则:</span>
                <span v-for="(item, index) in ignoreRules" :key="`rule-${index}`">
                    {{ index + 1 }}: {{ item }}
                </span>
                <span style="color: khaki">示例:</span>
                <span v-for="(item, index) in ignoreExamples" :key="`example-${index}`">
                    {{ index + 1 }}: <span class="rule-code">{{ item.rule }}</span> {{ item.mean }}
                </span>
            </div>
            <template #footer>
                <div class="ignore-dialog-footer">
                    <div class="btn" @click="ignoreDialogVisible = false"><i>关闭</i></div>
                </div>
            </template>
        </Dialog>

        <div class="banner">
            <div class="banner-left">
                <span class="hover-underline" @click="openInNotepad">在文件中查看/编辑</span>
                <i class="iconfont icon-shuaxin btn-like"
                   title="重新获取全部配置信息" @click="updateAllConfig"/>
            </div>
            <div class="banner-right">
                <i class="iconfont icon-back btn-like" title="返回" @click="back"/>
            </div>
        </div>
        <div class="overview">
            <div class="config-item">
                <div class="line1">
                    <span style="color: khaki;">远程(remote)</span>
                    <i class="iconfont icon-shuaxin btn-like"
                       title="重新获取远程信息" @click="updateRemote('get')"/>
                </div>
                <div class="line2">
                    <span v-if="remoteInfo && remoteInfo[0] !== '' && remoteInfo[1] !== ''"
                          class="editable" title="点击编辑"
                          @click="remoteOperateType = 'set-url'; remoteUrlToSet = remoteInfo[1]; remoteDialogVisible = true">
                        {{ remoteInfo[0] + '/' + remoteInfo[1] }}
                    </span>
                    <span v-else class="editable" title="点击添加"
                          @click="remoteOperateType = 'add'; remoteDialogVisible = true">
                        远程未定义
                    </span>
                </div>
            </div>
            <div class="config-item">
                <div class="line1">
                    <span style="color: khaki;">用户(user)</span>
                    <i class="iconfont icon-shuaxin btn-like"
                       title="重新获取用户信息" @click="updateUser('get', '')"/>
                </div>
                <div class="line2">
                    <span style="color: #9feaf9">姓名 </span>
                    <ClickToEdit style="width: 200px" :text="userInfo.name" @do-edit="updateUser('name', $event)"/>
                    <span style="color: #9feaf9">邮箱 </span>
                    <ClickToEdit style="width: 200px" :text="userInfo.email"
                                 @do-edit="updateUser('email', $event)"/>
                </div>
            </div>
            <div class="ignore-item">
                <div class="ignore-item-banner">
                    <span style="color: khaki;">忽略(ignore)</span>
                    <i class="iconfont icon-message btn-like"
                       title="查看ignore规则" @click="ignoreDialogVisible = true"/>
                    <i class="iconfont icon-shuaxin btn-like"
                       title="重新获取忽略规则" @click="updateIgnore('get')"/>
                    <i v-if="!ifEditIgnore" class="iconfont icon-record1 btn-like"
                       title="编辑" @click="ifEditIgnore = true"/>
                    <i v-if="ifEditIgnore" class="iconfont icon-guanbi btn-like"
                       title="取消" @click="ignoreFileStrToSet = ignoreInfo; ifEditIgnore = false"/>
                    <i v-if="ifEditIgnore" class="iconfont icon-check btn-like"
                       title="确认" @click="updateIgnore('set')"/>
                </div>

                <textarea class="ignore-item-file" v-model="ignoreFileStrToSet" :disabled="!ifEditIgnore"/>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/mixin";

.config-view {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: cursive;
    user-select: none;

    .banner {
        position: relative;
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .banner-left {
            span {
                position: relative;
                cursor: pointer;
                display: inline-block;
            }

            i {
                margin-left: 5px;
            }
        }
    }

    .overview {
        position: relative;
        width: 100%;
        height: calc(100% - 30px);

        .config-item {
            position: relative;
            width: 100%;
            height: 60px;
            line-height: 30px;
            white-space: nowrap;
            overflow: auto hidden;

            .line1, .line2 {
                @include mixin.doScrollbar(#777777, 2px);
                position: relative;
                width: 100%;
                height: 30px;
                overflow: auto hidden;
            }

            .editable {
                user-select: none;
                cursor: pointer;
                text-decoration: underline;
            }
        }

        .ignore-item {
            position: relative;
            width: 100%;
            height: calc(100% - 120px);

            .ignore-item-banner {
                position: relative;
                width: 100%;
                height: 30px;
                line-height: 30px;
            }

            .ignore-item-file {
                @include mixin.doScrollbar(#777777, 4px);
                position: relative;
                width: calc(100% - 10px);
                height: calc(100% - 40px);
                padding: 5px;
                border: solid 1px #86a5b1;
                outline: none;
                background-color: transparent;
                color: #86a5b1;
                resize: none;

                &:disabled {
                    opacity: 0.7;
                }

                &:focus {
                    border-color: #9feaf9;
                }
            }
        }
    }
}

.remote-dialog {
    .remote-dialog-content {
        width: 260px;
        height: 60px;
        background-color: #2f3241;
        font-family: cursive;
        line-height: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        overflow: hidden;

        .remote-name, .remote-url {
            height: 20px;
        }

        .remote-name-val {
            cursor: not-allowed;
            text-decoration: underline;
        }

        .remote-url-ipt {
            width: 100%;
            height: 19px;
            background-color: transparent;
            border: none;
            border-bottom: solid 1px #86a5b1;
            outline: none;
            color: #86a5b1;
            font-family: cursive;

            &:focus {
                border-color: #9feaf9;
            }
        }
    }

    .remote-dialog-footer {
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

.ignore-dialog {
    .ignore-dialog-content {
        @include mixin.doScrollbar(#777777, 4px);
        width: 300px;
        height: 100px;
        background-color: #2f3241;
        font-family: cursive;
        line-height: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        overflow: hidden auto;

        .rule-code {
            font-family: Consolas;
            font-style: italic;
            opacity: 0.7;
        }
    }

    .ignore-dialog-footer {
        position: relative;
        width: 300px;
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