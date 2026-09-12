<script setup lang="ts">
import { reactive } from "vue";
import {
    X,
    Mail,
    Send,
    LifeBuoy,
} from "lucide-vue-next";

const open = defineModel<boolean>("open");

const emit = defineEmits<{
    sent: [
        supportRequest: {
            subject: string;
            category: string;
            message: string;
        }
    ];
}>();

const categories = [
    "Projects",
    "Tasks",
    "Team",
    "Reports",
    "Account",
    "Notifications",
    "Other",
];

const form = reactive({
    subject: "",
    category: "",
    message: "",
});

function close() {
    form.subject = "";
    form.category = "";
    form.message = "";

    open.value = false;
}

function sendSupportEmail() {
    if (
        !form.subject.trim() ||
        !form.category ||
        !form.message.trim()
    ) {
        return;
    }

    emit("sent", {
        subject: form.subject.trim(),
        category: form.category,
        message: form.message.trim(),
    });

    close();
}
</script>

<template>
    <Transition name="fade">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-6"
        >
            <!-- Dialog -->
            <div
                class="
                    w-full
                    max-w-3xl
                    bg-white
                    rounded-lg
                    border
                    border-slate-200
                    shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
                    overflow-hidden
                "
            >
                <!-- Header -->
                <div
                    class="
                        flex
                        items-center
                        justify-between
                        px-8
                        py-5
                        border-b
                        border-slate-100
                    "
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="
                                h-11
                                w-11
                                rounded-lg
                                bg-blue-50
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <LifeBuoy
                                class="w-5 h-5 text-blue-600"
                            />
                        </div>

                        <div>
                            <h2
                                class="
                                    text-lg
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Contact Support
                            </h2>

                            <p
                                class="
                                    text-sm
                                    text-slate-500
                                    mt-0.5
                                "
                            >
                                Tell us how we can help and we'll get
                                back to you by email.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        @click="close"
                        class="
                            h-9
                            w-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            hover:bg-slate-100
                            transition
                        "
                    >
                        <X
                            class="w-5 h-5 text-slate-500"
                        />
                    </button>
                </div>

                <!-- Form -->
                <div class="px-8 py-6 space-y-5">

                    <!-- Subject + Category -->
                    <div
                        class="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        "
                    >
                        <!-- Subject -->
                        <div>
                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    uppercase
                                    tracking-wide
                                "
                            >
                                Subject
                            </label>

                            <input
                                v-model="form.subject"
                                type="text"
                                placeholder="What do you need help with?"
                                class="
                                    mt-2
                                    w-full
                                    h-11
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:border-slate-900
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-slate-900/5
                                "
                            />
                        </div>

                        <!-- Category -->
                        <div>
                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    uppercase
                                    tracking-wide
                                "
                            >
                                Category
                            </label>

                            <select
                                v-model="form.category"
                                class="
                                    mt-2
                                    w-full
                                    h-11
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:border-slate-900
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-slate-900/5
                                "
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Select a category
                                </option>

                                <option
                                    v-for="category in categories"
                                    :key="category"
                                    :value="category"
                                >
                                    {{ category }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Message -->
                    <div>
                        <div
                            class="
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    uppercase
                                    tracking-wide
                                "
                            >
                                Message
                            </label>

                            <span
                                class="text-xs text-slate-400"
                            >
                                {{ form.message.length }}/1000
                            </span>
                        </div>

                        <textarea
                            v-model="form.message"
                            rows="6"
                            maxlength="1000"
                            placeholder="Describe your issue or question in as much detail as possible..."
                            class="
                                mt-2
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                bg-slate-50
                                px-4
                                py-3
                                text-sm
                                text-slate-800
                                resize-none
                                outline-none
                                transition
                                focus:border-slate-900
                                focus:bg-white
                                focus:ring-4
                                focus:ring-slate-900/5
                            "
                        ></textarea>
                    </div>

                    <!-- Info -->
                    <div
                        class="
                            flex
                            items-center
                            gap-3
                            rounded-lg
                            border
                            border-blue-100
                            bg-blue-50
                            px-4
                            py-3
                        "
                    >
                        <Mail
                            class="
                                w-5
                                h-5
                                shrink-0
                                text-blue-600
                            "
                        />

                        <p
                            class="
                                text-sm
                                leading-5
                                text-blue-700
                            "
                        >
                            Your message will be sent to our support
                            team. We'll respond to the email associated
                            with your account.
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="
                        flex
                        items-center
                        justify-between
                        gap-3
                        px-8
                        py-4
                        border-t
                        border-slate-100
                        bg-slate-50
                    "
                >
                    <button
                        type="button"
                        @click="close"
                        class="
                            h-10
                            px-5
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-sm
                            font-medium
                            text-slate-600
                            hover:bg-slate-100
                            transition
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        @click="sendSupportEmail"
                        :disabled="
                            !form.subject.trim() ||
                            !form.category ||
                            !form.message.trim()
                        "
                        class="
                            h-10
                            px-6
                            rounded-lg
                            bg-slate-900
                            text-white
                            text-sm
                            font-semibold
                            hover:bg-black
                            transition
                            shadow-sm
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            disabled:hover:bg-slate-900
                        "
                    >
                        <Send class="w-4 h-4" />

                        Send Message
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

