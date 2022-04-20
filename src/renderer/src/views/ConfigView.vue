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
        remoteInfo.value = [ 'origin', '' ]
    }
    else if(remoteInfo.value[0] === '') {
        remoteInfo.value[0] = 'origin'
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

// region git remote `git remote add` / `git remote set-url`
const remoteOperateType = ref<'add' | 'set-url'>('add')
const remoteDialogVisible = ref(false)
const doRemote = (url: string) => {
    console.log(remoteOperateType.value, url)
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
                <input class="remote-url-ipt" v-model="remoteInfo[1]"
                       type="text" placeholder="请输入远程url" spellcheck="false">
            </div>
            <template #footer>
                <div class="remote-dialog-footer">
                    <div class="btn" @click="remoteDialogVisible = false"><i>取消</i></div>
                    <div class="btn" @click="doRemote"><i>确认</i></div>
                </div>
            </template>
        </Dialog>

        <div class="banner">
            <div class="banner-left">
                <span class="hover-underline" @click="openInNotepad">在文件中查看/编辑</span>
                <i class="iconfont icon-shuaxin" title="获取最新配置"/>
            </div>
            <div class="banner-right">
                <i class="iconfont icon-back" title="返回" @click="back"/>
            </div>
        </div>
        <div class="detail">
            <div class="line">
                <span class="key">远程(remote): </span>
                <span v-if="remoteInfo && remoteInfo[0] !== '' && remoteInfo[1] !== ''"
                      class="editable" title="点击编辑"
                      @click="remoteOperateType = 'set-url'; remoteDialogVisible = true">
                    {{ remoteInfo[0] + '/' + remoteInfo[1] }}
                </span>
                <span v-else class="editable" title="点击添加"
                      @click="remoteOperateType = 'add'; remoteDialogVisible = true">
                    远程未定义
                </span>
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

        %btn-base {
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

        .banner-left {
            span {
                position: relative;
                cursor: pointer;
                display: inline-block;
            }

            i {
                @extend %btn-base;
                margin-left: 5px;
            }
        }

        .banner-right {
            i {
                @extend %btn-base;
            }
        }
    }

    .detail {
        position: relative;
        width: 100%;
        height: calc(100% - 30px);

        .line {
            @include mixin.doScrollbar(#aaaaaa, 2px);
            position: relative;
            width: 100%;
            height: 30px;
            line-height: 30px;
            white-space: nowrap;
            overflow: auto hidden;

            .key {
                position: sticky;
                left: 0;
                color: khaki;
                background-color: #2f3241;
            }

            .editable {
                user-select: none;
                cursor: pointer;

                &:hover {
                    text-decoration: underline;
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
</style>