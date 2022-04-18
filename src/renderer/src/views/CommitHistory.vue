<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { LogResult } from "simple-git";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";
import { useGitStore } from "../stores/store_git";

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
            useToastStore().success('updated')
        }
        else {
            useToastStore().error(logInfo)
        }
    })
}
</script>

<template>
    <div class="commit-history">
        <div class="summary">
            共 {{ '123' }} 条提交记录
        </div>
        <div class="detail">

        </div>
    </div>
</template>

<style lang="scss" scoped>
.commit-history {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>