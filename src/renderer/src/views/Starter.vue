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
        icon: 'pi pi-book',
        text: '[Local] Drop the .git file here.',
        spin: false,
        blink: false
    },
    block: {
        icon: 'pi pi-sync',
        text: 'Waiting for parsing',
        spin: true,
        blink: true
    }
}
const infoConfig = ref(InfoPair.free)

const gitCreate = () => {
    useIpcRenderer().send('gitInitDialog')
    useIpcRenderer().once('gitInitDialogReply', (e, [ res, msg ]) => {
        console.log(res, msg)
        if(res) {
            if(msg === 'cancel') useToastStore().info('think twice before you press your mouse, fool!')
            else {
                useToastStore().success('git init success')
                gitExist(msg.gitDir)
            }
        }
        else {
            useToastStore().error(msg)
        }
    })
}
const gitExist = (path: string) => {
    if(!path.endsWith('.git')) {
        useToastStore().warn('Only .git files are accepted.')
        return
    }

    infoConfig.value = InfoPair.block
    useToastStore().info('parsing')
    useIpcRenderer().send('gitBase', { filePath: path })
    useIpcRenderer().once('gitBaseReply', (e, [ res, groupedInfo ]) => {
        infoConfig.value = InfoPair.free
        if(res) {
            const { remoteInfo, statusInfo } = groupedInfo
            useToastStore().info('parsed')
            useGitStore().useBaseDir(path)
            useGitStore().useRemoteInfo(remoteInfo)
            useGitStore().useStatusInfo(statusInfo)
            router.push({ name: 'GitView' })
        }
        else {
            useToastStore().error(groupedInfo)
        }
    })
}
</script>

<template>
    <div class="starter">
<!--        <Dialog class="remote-dialog" header="定义远程" v-model:visible="remoteDialogVisible">-->
<!--            <div class="remote-dialog-content">-->
<!--                <div class="remote-name"><span style="color: #9feaf9">名称: </span><span-->
<!--                    class="remote-name-val">{{ remoteInfo[0] === '' ? 'origin' : remoteInfo[0] }}</span></div>-->
<!--                <div class="remote-url" style="color: #9feaf9">url:</div>-->
<!--                <input class="remote-url-ipt" v-model="remoteUrlToSet"-->
<!--                       type="text" placeholder="请输入远程url" spellcheck="false">-->
<!--            </div>-->
<!--            <template #footer>-->
<!--                <div class="remote-dialog-footer">-->
<!--                    <div class="btn" @click="remoteDialogVisible = false"><i>取消</i></div>-->
<!--                    <div class="btn" @click="pushOrPullWithRemote"><i>确认</i></div>-->
<!--                </div>-->
<!--            </template>-->
<!--        </Dialog>-->

        <div class="create-container" @click="gitCreate">
            <LoadingInfo
                icon="pi pi-bolt" :spin="false"
                text="[New] click to init new repository." :blink="false"/>
        </div>

        <div class="clone-container">
            <LoadingInfo
                icon="pi pi-cloud-download" :spin="false"
                text="[Remote] click to pull remote repository." :blink="false"/>
        </div>

        <div class="receive-container">
            <div class="cover-layer">
                <FileReceiver @file-drop="gitExist"/>
            </div>
            <LoadingInfo
                :icon="infoConfig.icon" :spin="infoConfig.spin"
                :text="infoConfig.text" :blink="infoConfig.blink"/>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.starter {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    %container-base {
        position: relative;
        width: calc(100% - 2px);
        border: dashed 1px #86a5b1;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            color: #9feaf9;
            border-color: #9feaf9;
        }
    }

    .create-container {
        @extend %container-base;
        height: 38px;
        user-select: none;
        cursor: pointer;
    }

    .clone-container {
        @extend %container-base;
        height: 38px;
        user-select: none;
        cursor: pointer;
    }

    .receive-container {
        @extend %container-base;
        height: calc(100% - 102px);

        .cover-layer {
            position: absolute;
            z-index: 10;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
        }
    }
}
</style>