<script lang="ts" setup>
import { useRouter } from "vue-router";
import Dialog from "primevue/dialog";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";
import { onBeforeMount, ref } from "vue";
import { useGitStore } from "../stores/store_git";

const router = useRouter()
const remoteInfo = ref<[ string, string ]>(useGitStore().useRemoteInfo())

onBeforeMount(() => {
    if(remoteInfo.value === null) {
        useToastStore().warn('No remote info available.')
        router.push({
            name: 'Starter'
        })
        remoteInfo.value = [ '', '' ]
    }
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
    useToastStore().info('暂不支持, 请手动逐条刷新')
}

// region git remote
const remoteUrlToSet = ref('')
const remoteOperateType = ref<'add' | 'set-url'>('add')
const remoteDialogVisible = ref(false)
const updateRemote = (type: 'get' | 'set') => {
    if(type === 'get') {
        useIpcRenderer().send('gitRemoteGet')
        useIpcRenderer().once('gitRemoteGetReply', (e, [ res, msg ]) => {
            if(res) {
                remoteInfo.value = msg
                useGitStore().useRemoteInfo(msg)
                useToastStore().success('remote config updated')
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
                <div class="remote-name">名称: <span class="remote-name-val">{{ remoteInfo[0] }}</span></div>
                <div class="remote-url">url:</div>
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
                    <span class="key">远程(remote)</span>
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

    .btn-like {
        position: relative;
        width: 30px;
        height: 30px;
        border-radius: 5px;
        text-align: center;
        line-height: 30px;
        cursor: pointer;
        display: inline-block;

        &:hover {
            background-color: #cccccc1a;
        }
    }

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
                @include mixin.doScrollbar(#aaaaaa, 2px);
                position: relative;
                width: 100%;
                height: 30px;
                overflow: auto hidden;
            }

            .key {
                position: sticky;
                left: 0;
                color: khaki;
                background-color: #2f3241;
            }

            .editable {
                user-select: none;
                cursor: pointer;
                text-decoration: underline;
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
</style>