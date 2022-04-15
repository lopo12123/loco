<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useGitStore } from "../stores/store_git";
import { ref } from "vue";
import LoadingInfo from "../components/Misc/LoadingInfo.vue";
import { useIpcRenderer } from "../stores/store_ipc";

const router = useRouter()
const gitVersion = useGitStore().useGitVersion()

type DetectStage = 'detecting' | 'unavailable' | 'available'
const detectStage = ref<DetectStage>('detecting')
console.log(gitVersion)
// no 'git' available
if(gitVersion === 'unavailable') {
    detectStage.value = 'unavailable'
}
// undetected
else if(gitVersion === null) {
    useIpcRenderer().send('gitDetect')
    useIpcRenderer().once('gitDetectReply', (e, [res, msg]) => {
        console.log(res, msg)
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
                     text="This seems to be your first use, detecting git availability."/>
        <LoadingInfo v-if="detectStage === 'unavailable'"
                     :spin="false" icon="pi"/>
        <LoadingInfo v-if="detectStage === 'available'"/>
    </div>
</template>

<style lang="scss" scoped>
.initializer {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>