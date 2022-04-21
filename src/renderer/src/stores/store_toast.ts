import { ToastServiceMethods } from "primevue/toastservice";
import { ToastSeverity } from "primevue/api";

class StoreToast {
    #toast: ToastServiceMethods | null = null

    bind(ins: ToastServiceMethods | null) {
        this.#toast = ins
    }

    info(msg: string, title?: string, till: number = 3000) {
        this.#toast?.removeAllGroups()
        this.#toast?.add({
            severity: ToastSeverity.INFO,
            detail: msg,
            summary: title,
            life: till
        })
    }

    warn(msg: string, title?: string, till: number = 3000) {
        this.#toast?.removeAllGroups()
        this.#toast?.add({
            severity: ToastSeverity.WARN,
            detail: msg,
            summary: title,
            life: till
        })
    }

    error(msg: string, title?: string, till: number | undefined = undefined) {
        this.#toast?.removeAllGroups()
        this.#toast?.add({
            severity: ToastSeverity.ERROR,
            detail: msg,
            summary: title,
            life: till
        })
    }

    success(msg: string, title?: string, till: number = 3000) {
        this.#toast?.removeAllGroups()
        this.#toast?.add({
            severity: ToastSeverity.SUCCESS,
            detail: msg,
            summary: title,
            life: till
        })
    }

    close() {
        this.#toast?.removeAllGroups()
    }
}

const _ = new StoreToast()

export const useToastStore = (): StoreToast => _