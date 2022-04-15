<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useGitStore } from "../stores/store_git";
import { ref } from "vue";
import LoadingInfo from "../components/Misc/LoadingInfo.vue";
import { useIpcRenderer } from "../stores/store_ipc";
import { useToastStore } from "../stores/store_toast";

const router = useRouter()
const gitVersion = useGitStore().useGitVersion()

type DetectStage = 'detecting' | 'unavailable' | 'available'
const detectStage = ref<DetectStage>('detecting')

const downloadGit = () => {
    const url = 'https://git-scm.com/downloads'
    useIpcRenderer().send('browser', { urlToOpen: url })
    useIpcRenderer().once('browserReply', (e, [ res, msg ]) => {
        res
            ? useToastStore().success(msg)
            : useToastStore().error(msg)
    })
}

// no 'git' available
if(gitVersion === 'unavailable') {
    detectStage.value = 'unavailable'
}
// undetected
else if(gitVersion === null) {
    useIpcRenderer().send('gitDetect')
    useIpcRenderer().once('gitDetectReply', (e, [ res, msg ]) => {
        if(!res) detectStage.value = 'unavailable'
        else {
            detectStage.value = 'available'
            useGitStore().useGitVersion(msg)

            setTimeout(() => {
                router.push({
                    name: 'Starter'
                })
            }, 1_000)
        }
    })
}
// detected
else {
    router.push({
        name: 'Starter'
    })
}

</script>

<template>
    <div class="initializer">
        <LoadingInfo v-if="detectStage === 'detecting'"
                     :spin="true" icon="pi pi-compass"
                     text="This seems to be your first use, detecting git`s availability."/>
        <div class="box-with-link" v-if="detectStage === 'unavailable'">
            <LoadingInfo :spin="false" icon="pi pi-exclamation-triangle"
                         :blink="false" text="git is not available."/>
            <span class="link" @click="downloadGit">
                <i class="pi pi-link"/>click me to download git in your browser.
            </span>
        </div>
        <LoadingInfo v-if="detectStage === 'available'"
                     :spin="false" icon="pi pi-check"
                     :blink="false" text="git available."/>
    </div>
</template>

<style lang="scss" scoped>
.initializer {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .box-with-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .link {
            margin-top: 10px;
            color: #9feaf9;
            cursor: pointer;
            user-select: none;
        }
    }
}
</style>