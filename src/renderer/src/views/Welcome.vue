<script lang="ts" setup>
import LoadingInfo from "../components/Misc/LoadingInfo.vue";
import FileReceiver from "../components/Misc/FileReceiver.vue";
import { useToastStore } from "../stores/store_toast";
import { ref } from "vue";

const InfoPair = {
    free: {
        icon: 'pi pi-bell',
        text: 'Drop the .git file here to start.',
        spin: false
    },
    block: {
        icon: 'pi pi-sync',
        text: 'Waiting for parsing',
        spin: true
    }
}
const infoConfig = ref(InfoPair.free)

const solveGitPath = (path: string) => {
    if(!path.endsWith('.git')) {
        useToastStore().warn('Invalid path, only .git files are accepted.')
    }
    else {
        // TODO ipc发送路径信息 - 后台调用git - 回调跳转到详情页面
        infoConfig.value = InfoPair.block
    }
}
</script>

<template>
    <div class="welcome">
        <div class="receive-container">
            <FileReceiver @file-drop="solveGitPath"/>
        </div>
        <div class="info-container">
            <LoadingInfo
                :icon="infoConfig.icon" :spin="infoConfig.spin"
                :text="infoConfig.text"/>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.welcome {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .receive-container {
        position: absolute;
        z-index: 10;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        border: dashed 1px #9feaf9cc;
        border-radius: 5px;
    }
}
</style>