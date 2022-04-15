<script lang="ts" setup>
import { version } from "../../public/manifest.json";
import { useIpcRenderer } from "../stores/store_ipc";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { useGitStore } from "../stores/store_git";

const route = useRoute()
const router = useRouter()

const appVersion = version
const gitVersion = useGitStore().useGitVersion()
const ifShowHomeBtn = computed(() => {
    return (route.name ?? '') as string
})

type BannerOperates = 'home' | 'min' | 'refresh' | 'max' | 'close'
const doBannerOperate = (op: BannerOperates) => {
    switch(op) {
        case 'home':
            router.push({ name: 'Starter' })
            break
        case 'refresh':
            window.location.reload()
            break
        case 'min':
        case 'max':
        case 'close':
            useIpcRenderer().send('banner', { type: op })
            break
    }
}
</script>

<template>
    <div class="app-banner">
        <div class="tag">
            <img class="logo" src="" alt="logo">
            <span class="app-version">[app version {{ appVersion }}]</span>
            <span v-if="gitVersion !== null" class="git-version">[{{ gitVersion }}]</span>
        </div>

        <div class="btn-group">
            <div v-if="ifShowHomeBtn !== 'Starter'"
                 class="btn hover-spin"
                 @click="doBannerOperate('home')">
                <i class="iconfont icon-home"/>
            </div>
            <div class="btn hover-spin"
                 @click="doBannerOperate('min')">
                <i class="iconfont icon-zuixiaohua"/>
            </div>
            <div class="btn hover-spin"
                 @click="doBannerOperate('refresh')">
                <i class="iconfont icon-shuaxin"/>
            </div>
            <div class="btn hover-spin"
                 @click="doBannerOperate('max')">
                <i class="iconfont icon-zuidahua"/>
            </div>
            <div class="btn hover-spin"
                 @click="doBannerOperate('close')">
                <i class="iconfont icon-guanbi"></i>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.app-banner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    -webkit-app-region: drag;

    .tag {
        position: relative;
        width: fit-content;
        height: 20px;
        margin: 10px;
        font-size: 12px;
        line-height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;

        .logo {
        }

        .app-version {
            margin-left: 10px;
            font-size: 10px;
        }
        .git-version {
            margin-left: 10px;
            font-size: 10px;
        }
    }

    .btn-group {
        position: relative;
        width: fit-content;
        height: 100%;
        margin: 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .btn {
            position: relative;
            width: 30px;
            height: 30px;
            //margin: 0 5px;
            border-radius: 5px;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
            -webkit-app-region: no-drag;

            &:hover {
                > i {
                    color: #9feaf9;
                }
            }
        }
    }
}
</style>