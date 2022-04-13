<script lang="ts" setup>
import { withDefaults } from "vue";

const props = withDefaults(defineProps<{
    text?: string
}>(), {
    text: 'loading'
})
</script>

<template>
    <div class="loading-info">
        <i class="pi pi-sync pi-spin"/>
        <span class="blink">
            {{ props.text }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
@use "../../styles/mixin";

.loading-info {
    position: relative;
    min-width: 100px;
    width: fit-content;
    height: 30px;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    i {
        margin-right: 5px;
        font-size: 12px;
    }

    .blink {
        @include mixin.doBlink(3s);
        position: relative;
        width: fit-content;
        display: inline-block;
    }
}
</style>