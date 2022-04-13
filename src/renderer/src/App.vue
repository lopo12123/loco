<script lang="ts" setup>
import AppBanner from "./layouts/AppBanner.vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { useToastStore } from "./stores/store_toast";

const toast = useToast()
useToastStore().bind(toast)
</script>

<template>
    <div class="app">

        <Toast/>

        <div class="banner-container">
            <AppBanner/>
        </div>
        <div class="view-container">
            <router-view/>
        </div>
    </div>
</template>

<style lang="scss">
.app {
    position: relative;
    width: 100%;
    height: 100%;

    .banner-container {
        position: relative;
        width: 100%;
        height: 40px;
        border-bottom: solid 1px #86a5b1;
    }

    .view-container {
        position: relative;
        width: calc(100% - 20px);
        height: calc(100% - 61px);
        padding: 10px;
    }
}
</style>
