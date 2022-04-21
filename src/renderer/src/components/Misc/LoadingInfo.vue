<script lang="ts" setup>
import { withDefaults } from "vue";

const props = withDefaults(defineProps<{
    icon?: string
    spin?: boolean
    text?: string
    blink?: boolean
}>(), {
    icon: 'pi pi-sync',
    spin: true,
    text: 'loading',
    blink: true
})
</script>

<template>
    <div class="loading-info">
        <i :class="[props.icon, props.spin ? 'pi-spin' : '']"/>
        <span :class="props.blink ? 'blink' : 'default'">
            {{ props.text }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
@use "../../styles/mixin";

.loading-info {
    position: relative;
    min-width: 100px;
    max-width: 400px;
    width: fit-content;
    height: 30px;
    line-height: 18px;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    i {
        margin-right: 5px;
        font-size: 12px;
        opacity: 0.8;
    }

    .blink {
        @include mixin.doBlink(3s);
        position: relative;
        width: fit-content;
        display: inline-block;
    }
    .default {
        position: relative;
        width: fit-content;
        display: inline-block;
    }
}
</style>