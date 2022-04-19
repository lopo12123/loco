<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import Dialog from "primevue/dialog";
import type { LogResult, DefaultLogFields } from "simple-git";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";
import { useGitStore } from "../stores/store_git";
import { useRouter } from "vue-router";

const router = useRouter()
const logInfoRef = ref<LogResult | null>(useGitStore().useLogInfo())

onBeforeMount(() => {
    if(!logInfoRef.value) updateLogInfo()
})

const updateLogInfo = () => {
    useIpcRenderer().send('gitLog')
    useIpcRenderer().once('gitLogReply', (e, [ res, logInfo ]) => {
        if(res) {
            useGitStore().useLogInfo(logInfo)
            logInfoRef.value = logInfo
            useToastStore().success('commit list updated')
        }
        else {
            useToastStore().error(logInfo)
        }
    })
}

/**
 * @description 返回 git-view 页面
 */
const back = () => {
    router.push({
        name: 'GitView'
    })
}

// region reset
const resetDialogVisible = ref(false)
const rebaseTarget = ref<DefaultLogFields | null>(null)
/**
 * @description 硬重置到此提交
 */
const doReset = () => {
    console.log('reset hard to: ', rebaseTarget.value)
}
// endregion
</script>

<template>
    <div class="commit-history">
        <Dialog class="reset-dialog" header="版本回退" v-model:visible="resetDialogVisible">
            <div class="reset-dialog-content">
                <i class="alert-logo pi pi-exclamation-triangle"/>
                <div class="information">
                    <div class="info1">
                        当前目录即将执行回退,目标版本的提交信息:
                    </div>
                    <div class="viewport">
                        <i>{{ rebaseTarget.message }}</i>
                    </div>
                    <div>
                        继续此操作将丢弃目标版本后的<b><u>全部更改</u></b>且<b><u>无法恢复</u></b>, 确认继续?
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="reset-dialog-footer">
                    <div class="btn" @click="resetDialogVisible = false"><i>取消</i></div>
                    <div class="btn" @click="doReset"><i>确认</i></div>
                </div>
            </template>
        </Dialog>
        <div class="summary">
            <div class="summary-left">
                <span>共 <span class="highlight">{{ logInfoRef?.total ?? '??' }}</span> 条提交记录</span>
                <i class="iconfont icon-shuaxin" title="获取最新状态" @click="updateLogInfo"/>
            </div>
            <div class="summary-right">
                <i class="iconfont icon-back" title="返回" @click="back"/>
            </div>
        </div>
        <div class="detail" v-if="logInfoRef">
            <div class="line table-banner">
                <div class="index">序号</div>
                <div class="author-name">作者</div>
                <div class="date">日期</div>
                <div class="hash">哈希</div>
                <div class="message">提交信息</div>
            </div>
            <div class="line" v-for="(item, index) in logInfoRef.all">
                <div class="index">{{ index + 1 }}</div>
                <div class="author-name" :title="`email: ${item.author_email}`">{{ item.author_name }}</div>
                <div class="date">{{ new Date(item.date).toLocaleString('zh-cn', {hour12: false}) }}</div>
                <div class="hash">
                    <i class="iconfont icon-bazi" title="重置到此提交" @click="rebaseTarget = item; resetDialogVisible = true"/>
                    {{ item.hash }}
                </div>
                <div class="message">{{ item.message }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/mixin";

.commit-history {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: cursive;
    user-select: none;

    .highlight {
        color: #9feaf9;
    }

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

    .summary {
        position: relative;
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .summary-left {
            i {
                @extend %btn-base;
                margin-left: 5px;
            }
        }

        .summary-right {
            i {
                @extend %btn-base;
            }
        }
    }

    .detail {
        @include mixin.doScrollbar(#aaaaaa, 4px);
        position: relative;
        width: 100%;
        height: calc(100% - 30px);
        overflow: hidden auto;

        .line {
            position: relative;
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            %ceil-base {
                @include mixin.doScrollbar(#aaaaaa, 2px);
                position: relative;
                overflow: auto hidden;
                white-space: nowrap;
            }

            .index {
                @extend %ceil-base;
                width: 30px;
                margin-right: 10px;
            }

            .author-name {
                @extend %ceil-base;
                width: 60px;
                margin-right: 10px;
                cursor: pointer;

                &:hover {
                    text-decoration: underline;
                }
            }

            .date {
                @extend %ceil-base;
                width: 140px;
                margin-right: 10px;
            }

            .hash {
                width: 120px;
                margin-right: 10px;
                padding-right: 10px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;

                i {
                    cursor: pointer;

                    &:hover {
                        color: khaki;
                    }
                }
            }

            .message {
                @extend %ceil-base;
                width: calc(100% - 400px);
            }
        }

        .table-banner {
            position: sticky;
            z-index: 2;
            top: 0;
            left: 0;
            background-color: #2f3241;
        }
    }
}

.reset-dialog {
    box-sizing: content-box;

    .reset-dialog-content {
        position: relative;
        width: 300px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .alert-logo {
            width: 30px;
            height: 30px;
            font-size: 24px;
            line-height: 30px;
            text-align: center;
        }

        .information {
            width: calc(100% - 50px);
            font-size: 12px;
            line-height: 16px;
            font-family: cursive;

            .viewport {
                @include mixin.doScrollbar(#aaaaaa, 2px);
                height: 32px;
                max-height: 32px;
                overflow: hidden auto;
            }
        }
    }

    .reset-dialog-footer {
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