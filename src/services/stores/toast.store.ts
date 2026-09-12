import { defineStore } from "pinia";
import { ref } from "vue";

export type ToastType =
    | "success"
    | "error"
    | "warning"
    | "info";

export const useToastStore = defineStore(
    "toast",
    () => {

        const visible = ref(false);
        const message = ref("");
        const type = ref<ToastType>("info");

        let timeout: ReturnType<
            typeof setTimeout
        > | null = null;


        function show(
            newMessage: string,
            newType: ToastType = "info",
            duration = 3000,
        ) {

            message.value =
                newMessage;

            type.value =
                newType;

            visible.value =
                true;


            if (timeout) {
                clearTimeout(timeout);
            }


            timeout = setTimeout(() => {

                visible.value =
                    false;

            }, duration);
        }


        function success(
            message: string,
        ) {
            show(
                message,
                "success",
            );
        }


        function error(
            message: string,
        ) {
            show(
                message,
                "error",
            );
        }


        function warning(
            message: string,
        ) {
            show(
                message,
                "warning",
            );
        }


        function info(
            message: string,
        ) {
            show(
                message,
                "info",
            );
        }


        function hide() {
            visible.value =
                false;
        }


        return {
            visible,
            message,
            type,
            show,
            success,
            error,
            warning,
            info,
            hide,
        };

    }
);