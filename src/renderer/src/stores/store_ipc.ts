import { CB_Renderer, Channel } from "../../../common/declare";

const bannerIpc = window.ipc[Channel.banner] as CB_Renderer[Channel.banner]



export {
    bannerIpc
}