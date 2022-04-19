<script lang="ts" setup>

import { useRouter } from "vue-router";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";

const router = useRouter()

const openInNotepad = () => {
    useIpcRenderer().send('gitConfigEdit')
    useIpcRenderer().once('gitConfigEditReply', (e, [ res, msg ]) => {
        if(!res) useToastStore().error(msg)
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
</script>

<template>
    <div class="config-view">
        <div class="banner">
            <div class="banner-left">
                <span class="hover-underline" @click="openInNotepad">在文件中查看/编辑</span>
                <i class="iconfont icon-shuaxin" title="获取最新状态"/>
            </div>
            <div class="banner-right">
                <i class="iconfont icon-back" title="返回" @click="back"/>
            </div>
        </div>
        <div class="detail">
            details
        </div>
    </div>
</template>

<style lang="scss" scoped>
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

    }
}
</style>