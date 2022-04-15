<script lang="ts" setup>
import LoadingInfo from "../components/Misc/LoadingInfo.vue";
import FileReceiver from "../components/Misc/FileReceiver.vue";
import { ref } from "vue";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";
import { useGitStore } from "../stores/store_git";
import { useRouter } from "vue-router";

const router = useRouter()

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
        useToastStore().warn('Only .git files are accepted.')
        return
    }

    infoConfig.value = InfoPair.block
    useToastStore().info('parsing')
    useIpcRenderer().send('gitInit', { filePath: path })
    useIpcRenderer().once('gitInitReply', (e, [ res, msg ]) => {
        infoConfig.value = InfoPair.free
        if(res) {
            useToastStore().info('parsed')
            useGitStore().useBaseDir(path)
            useGitStore().useStatusInfo(msg)
            router.push({ name: 'GitView' })
        }
        else {
            useToastStore().error(msg)
        }
    })
}
</script>

<template>
    <div class="starter">
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
.starter {
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