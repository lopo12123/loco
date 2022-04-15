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
            <div class="line">
                提交(commit, compare with remote):
                超前(ahead) <span class="highlight">{{ statusInfo.ahead }}</span> 条;
                滞后(behind) <span class="highlight">{{ statusInfo.behind }}</span> 条.
            </div>
            <div class="line">
                变更(changes):
                新增(created) <span class="highlight">{{ statusInfo.created.length }}</span> 项;
                删除(deleted) <span class="highlight">{{ statusInfo.deleted.length }}</span> 项;
                修改(modified) <span class="highlight">{{ statusInfo.modified.length }}</span> 项;
                重命名(renamed) <span class="highlight">{{ statusInfo.renamed.length }}</span> 项.
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

        .line {
            position: relative;
            width: 100%;
            min-height: 30px;
            line-height: 30px;

            .highlight {
                color: #9feaf9;
            }
        }
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