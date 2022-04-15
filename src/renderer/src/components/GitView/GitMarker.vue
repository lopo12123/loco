<script lang="ts" setup>
import { defineProps } from "vue";
import { GitMark } from "../../../../common/git";

const MarkConfig: {
    [k: GitMark]: {
        front: string
        back: string
        mark: string
        title: string
    }
} = {
    ' ': {
        front: '#16B42C',
        back: '#85f399',
        mark: '=',
        title: '文件未修改'
    },
    M: {
        front: '#b28c00',
        back: '#f7e79f',
        mark: 'M',
        title: '文件已修改(modified)'
    },
    T: {
        front: '#063fdb',
        back: '#c4dbfa',
        mark: 'T',
        title:'文件类型改变(type changed)'
    },
    A: {
        front: '#067d17',
        back: '#b5e7be',
        mark: 'M',
        title: '新增的(added)'
    },
    D: {
        front: '#ce0505',
        back: '#fca4a7',
        mark: 'D',
        title: '已删除(deleted)'
    },
    R: {
        front: '#028e8e',
        back: '#bfeeee',
        mark: 'R',
        title: '重命名(renamed)'
    },
    C: {
        front: '#b309b3',
        back: '#f3d2f3',
        mark: 'C',
        title: '复制(copied)'
    },
    U: {
        front: '#2d61f0',
        back: '#95c2ff',
        mark: 'U',
        title: '更新但未合并(unmerged)'
    },
    '?': {
        front: '#929292',
        back: '#e6e6e6',
        mark: '?',
        title: '文件未追踪(untracked)'
    },
    '!': {
        front: '#656565',
        back: '#b7b7b7',
        mark: '!',
        title: '文件被忽略(ignored)'
    }
}

const props = defineProps<{
    mark: GitMark
}>()

const front = MarkConfig[props.mark]?.front ?? '#000000'
const back = MarkConfig[props.mark]?.back ?? '#ffffff'
const mark = MarkConfig[props.mark]?.mark ?? '??'
const tooltip = MarkConfig[props.mark]?.title ?? '未定义的标识(undefined)'
</script>

<template>
    <div class="git-state-tag" :title="tooltip"
         :style="`color:${front}; background-color: ${back}; border: solid 1px ${back}`">
        <span>{{ mark }}</span>
    </div>
</template>

<style lang="scss" scoped>
.git-state-tag {
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: 5px;
    cursor: pointer;
    user-select: none;
    border-radius: 10px;
    font-family: Consolas;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>