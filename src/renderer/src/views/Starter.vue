<script lang="ts" setup>
import Dialog from "primevue/dialog";
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

const cloneDialogVisible = ref(false)
const remoteUrl = ref('')
const gitClone = () => {
    if(!remoteUrl.value.endsWith('.git')) {
        useToastStore().warn('invalid git url')
    }
    else {
        cloneDialogVisible.value = false
        useToastStore().info('cloning, please wait.', '', undefined)
        useIpcRenderer().send('gitClone', { repoPath: remoteUrl.value })
        useIpcRenderer().once('gitCloneReply', (e, [ res, msg ]) => {
            if(!res) useToastStore().error(msg)
            else {
                if(msg === 'cancel') useToastStore().info('think twice before you press your mouse, fool!')
                else {
                    useToastStore().success(`your project is cloned to ${ msg }`, '', undefined)
                    gitExist(msg)
                }
            }
        })
    }
}

const gitInit = () => {
    useIpcRenderer().send('gitInitDialog')
    useIpcRenderer().once('gitInitDialogReply', (e, [ res, msg ]) => {
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
        <Dialog class="clone-dialog" header="克隆远程" v-model:visible="cloneDialogVisible">
            <div class="clone-dialog-content">
                <span class="label">git 地址:</span>
                <input class="val-url" type="text" v-model="remoteUrl" placeholder="请输入git仓库地址">
            </div>
            <template #footer>
                <div class="clone-dialog-footer">
                    <div class="btn" @click="cloneDialogVisible = false"><i>取消</i></div>
                    <div class="btn" @click="gitClone"><i>下一步</i></div>
                </div>
            </template>
        </Dialog>

        <div class="create-container" @click="gitInit">
            <LoadingInfo
                icon="pi pi-bolt" :spin="false"
                text="[New] click to init new repository." :blink="false"/>
        </div>

        <div class="clone-container" @click="remoteUrl = ''; cloneDialogVisible = true">
            <LoadingInfo
                icon="pi pi-cloud-download" :spin="false"
                text="[Remote] click to clone remote repository." :blink="false"/>
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

.clone-dialog {
    box-sizing: content-box;

    .clone-dialog-content {
        width: 260px;
        height: 30px;
        background-color: #2f3241;
        font-family: cursive;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        overflow: hidden;

        .label {
            width: 70px;
        }

        .val-url {
            width: calc(100% - 70px);
            height: 19px;
            border: none;
            border-bottom: solid 1px #86a5b1;
            outline: none;
            background-color: transparent;
            color: #86a5b1;
            font-family: cursive;
        }
    }

    .clone-dialog-footer {
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