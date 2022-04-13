<script lang="ts" setup>
type BannerOperates = 'min' | 'refresh' | 'max' | 'close'
const doBannerOperate = (op: BannerOperates) => {
    switch(op) {
        case 'min':
            console.log('min')
            break
        case 'refresh':
            window.location.reload()
            break
        case 'max':
            console.log('max')
            break
        case 'close':
            console.log('close')
            break
    }
}
</script>

<template>
    <div class="app-banner">
        <div class="logo">
            logo
        </div>

        <div class="btn-group">
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

    .logo {
        position: relative;
        width: 100px;
        height: 20px;
        margin: 10px;
        line-height: 20px;
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
            margin: 0 5px;
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