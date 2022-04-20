<script lang="ts" setup>
import { defineEmits, defineProps, ref } from "vue";

const props = defineProps<{
    text: string
}>()
const emits = defineEmits<{
    (event: 'do-edit', val: string): void
}>()

const state = ref<'show' | 'edit'>('show')
const editVal = ref('')
const startEdit = () => {
    editVal.value = props.text
    state.value = 'edit'
}
</script>

<template>
    <div class="click-to-edit">
        <span v-if="state === 'show'" class="show"
              :title="props.text" @click="startEdit">
            {{ props.text }}
        </span>

        <input v-if="state === 'edit'" class="edit"
               type="text" spellcheck="false" v-model="editVal">
        <i v-if="state === 'edit'" class="iconfont icon-guanbi btn-like" title="取消" @click="state = 'show'"/>
        <i v-if="state === 'edit'" class="iconfont icon-check btn-like" title="确认" @click="emits('do-edit', editVal)"/>
    </div>
</template>

<style lang="scss" scoped>
.click-to-edit {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 20px;
    font-family: cursive;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .show {
        width: 100%;
        user-select: none;
        cursor: pointer;
        text-decoration: underline;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .edit {
        width: calc(100% - 30px);
        height: 19px;
        line-height: 20px;
        border: none;
        border-bottom: solid 1px #86a5b1;
        outline: none;
        background-color: transparent;
        color: #86a5b1;

        &:focus {
            border-color: #9feaf9;
        }
    }
}
</style>