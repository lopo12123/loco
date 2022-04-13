<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useToastStore } from "@renderer/stores/store_toast";

const emits = defineEmits<{
    (event: 'file-drop', val: string): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)

const dropListener = (e: DragEvent) => {
    e.preventDefault()

    const files = e.dataTransfer.files
    if(files && files.length > 0) {
        // @ts-ignore
        const path = files[0].path as string
        if(!path) {
            useToastStore().warn('Electron only')
        }
        else {
            // useToastStore().info(path, 'Path')
            emits('file-drop', path)
        }
    }
}
const dragOverListener = (e: DragEvent) => {
    e.preventDefault()
}

onMounted(() => {
    console.log(containerRef.value)
    containerRef.value?.addEventListener('drop', dropListener)
    containerRef.value?.addEventListener('dragover', dragOverListener)
})
onUnmounted(() => {
    containerRef.value?.removeEventListener('drop', dropListener)
    containerRef.value?.removeEventListener('dragover', dragOverListener)
})
</script>

<template>
    <div class="file-receiver" ref="containerRef"></div>
</template>

<style lang="scss" scoped>
.file-receiver {
    position: relative;
    width: 100%;
    height: 100%;
    opacity: 0;
}
</style>