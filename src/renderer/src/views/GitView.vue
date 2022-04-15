<script lang="ts" setup>
import { useGitStore } from "../stores/store_git";
import GitMarker from "../components/GitView/GitMarker.vue";
import { useRouter } from "vue-router";
import { useToastStore } from "../stores/store_toast";
import { onBeforeMount } from "vue";

const router = useRouter()
const statusInfo = useGitStore().useStatusInfo()

onBeforeMount(() => {
    if(!statusInfo) {
        useToastStore().warn('No git info available.')
        router.push({
            name: 'Starter'
        })
    }
})

</script>

<template>
    <div class="git-view" v-if="statusInfo">
        <div class="head">
            <div class="pair">
                超出远程: {{ statusInfo.ahead }} 条提交
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
                <div class="filename">{{ item.path }}</div>
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

    .head {
        position: relative;
        width: 100%;
        height: 100px;
    }

    .body {
        @include mixin.doScrollbar(#3f4669);
        position: relative;
        width: 100%;
        height: calc(100% - 100px);
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