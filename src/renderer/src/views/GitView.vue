<script lang="ts" setup>
import { useGitStore } from "../stores/store_git";
import GitMarker from "../components/GitView/GitMarker.vue";
import { useRouter } from "vue-router";
import { useToastStore } from "../stores/store_toast";
import { onBeforeMount } from "vue";
import { useIpcRenderer } from "../stores/store_ipc";

const router = useRouter()
const baseDir = useGitStore().useBaseDir()
const remoteInfo = useGitStore().useRemoteInfo()
const statusInfo = useGitStore().useStatusInfo()

onBeforeMount(() => {
    if(!baseDir || !remoteInfo || !statusInfo) {
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
            useToastStore().success('updated')
        }
        else {
            useToastStore().error(statusInfo)
        }
    })
}
</script>

<template>
    <div class="git-view" v-if="baseDir && remoteInfo && statusInfo">
        <div class="head">
            <div class="line path-block">
                <span class="h-key">git路径(root) </span>
                <span class="root-path" @click="openInExplorer('base', '')">{{ baseDir }}</span>
                <div class="op-btn">
                    <div class="btn" title="获取最新git记录" @click="updateGitInfo">
                        <i class="iconfont icon-shuaxin"/>
                    </div>
                    <div class="btn" title="设置">
                        <i class="iconfont icon-set"/>
                    </div>
                </div>
            </div>
            <div class="line">
                <span class="h-key">远程(remote):</span>
                名称(name) <span class="h-val">{{ remoteInfo[0] }}</span>;
                地址(url) <span class="h-val">{{ remoteInfo[1] }}</span>
            </div>
            <div class="line">
                <span class="h-key">提交(commit):</span>
                [compare with remote]
                超前(ahead) <span class="h-val">{{ statusInfo.ahead }}</span> 条;
                滞后(behind) <span class="h-val">{{ statusInfo.behind }}</span> 条.
            </div>
            <div class="line">
                <span class="h-key">变更(changes):</span>
                新增(created) <span class="h-val">{{ statusInfo.created.length }}</span> 项;
                删除(deleted) <span class="h-val">{{ statusInfo.deleted.length }}</span> 项;
                修改(modified) <span class="h-val">{{ statusInfo.modified.length }}</span> 项;
                重命名(renamed) <span class="h-val">{{ statusInfo.renamed.length }}</span> 项.
            </div>
        </div>
        <div class="body">
            <div class="line table-header">
                <div class="index">序号</div>
                <div class="marker">类型</div>
                <div class="filename">文件</div>
            </div>

            <div class="line" v-for="(item, index) in statusInfo.files" :key="index">
                <div class="index">{{ index + 1 }}</div>
                <div class="marker">
                    <!--                    <GitMarker :mark="item.index"/>-->
                    <!--                    <GitMarker :mark="item.working_dir"/>-->
                </div>
                <div class="filename">
                    <span class="link" @click="openInExplorer('file', item.path)">{{ item.path }}</span>
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

            &:hover {
                .op-btn {
                    opacity: 1;
                }
            }

            .root-path {
                //color: #9feaf9;
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
                opacity: 0;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                transition: opacity 1s ease;

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
            @include mixin.doScrollbar(#aaaaaa, 2px);
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
        @include mixin.doScrollbar(#aaaaaa, 4px);
        position: relative;
        width: 100%;
        height: calc(100% - 130px);
        overflow: hidden auto;

        .line {
            position: relative;
            width: 100%;
            height: 40px;
            background-color: #2f3241;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .index {
                width: 100px;
            }

            .marker {
                width: 100px;
            }

            .filename {
                width: calc(100% - 200px);
            }
        }

        .table-header {
            position: sticky;
            top: 0;
            z-index: 10;
        }
    }
}
</style>