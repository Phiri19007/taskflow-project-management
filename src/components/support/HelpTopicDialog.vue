<script setup lang="ts">
import { ref, watch } from "vue";

import {
    X,
    ArrowRight,
    ArrowLeft,
    LifeBuoy,
    CheckCircle2,
    BookOpen,
} from "lucide-vue-next";

type HelpArticle = {
    title: string;
    description: string;
    steps: string[];
};

type HelpCategory = {
    title: string;
    description: string;
    icon: any;
    iconClass: string;
    overview: string;
    articles: HelpArticle[];
};

const props = defineProps<{
    open: boolean;
    category: HelpCategory | null;
}>();

const emit = defineEmits<{
    close: [];
}>();

const selectedArticle = ref<HelpArticle | null>(null);

function close() {
    selectedArticle.value = null;
    emit("close");
}

function openArticle(article: HelpArticle) {
    selectedArticle.value = article;
}

function backToArticles() {
    selectedArticle.value = null;
}

/*
 * Reset the selected article whenever another
 * category is opened.
 */
watch(
    () => props.category,
    () => {
        selectedArticle.value = null;
    }
);
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="props.open && props.category" class="
                    fixed
                    inset-0
                    z-50
                    flex
                    items-center
                    justify-center
                    bg-slate-950/40
                    p-6
                    backdrop-blur-sm
                " @click.self="close">
                <!-- Dialog -->
                <div class="
                        w-full
                        max-w-5xl
                        overflow-hidden
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
                    ">
                    <!-- Header -->
                    <div class="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-slate-100
                            px-10
                            py-6
                        ">
                        <div class="flex items-center gap-4">
                            <div :class="[
                                'flex h-11 w-11 items-center justify-center rounded-lg',
                                props.category.iconClass,
                            ]">
                                <component :is="props.category.icon" class="h-5 w-5" />
                            </div>

                            <div>
                                <span class="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-slate-400
                                    ">
                                    {{ selectedArticle ? "Guide" : "Help Topic" }}
                                </span>

                                <h2 class="
                                        mt-1
                                        text-lg
                                        font-bold
                                        text-slate-900
                                    ">
                                    {{
                                        selectedArticle
                                            ? selectedArticle.title
                                            : props.category.title
                                    }}
                                </h2>
                            </div>
                        </div>

                        <!-- Close -->
                        <button type="button" class="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-700
                            " aria-label="Close help topic" @click="close">
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="
                            max-h-[70vh]
                            min-h-115
                            overflow-y-auto
                            px-10
                            py-8
                        ">
                        <!-- ================================= -->
                        <!-- ARTICLE / GUIDE VIEW               -->
                        <!-- ================================= -->

                        <template v-if="selectedArticle">
                            <!-- Back -->
                            <button type="button" class="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    transition
                                    hover:text-blue-600
                                " @click="backToArticles">
                                <ArrowLeft class="h-3.5 w-3.5" />

                                Back to {{ props.category.title }} guides
                            </button>

                            <!-- Article heading -->
                            <div class="mt-6 max-w-3xl">
                                <div class="
                                        flex
                                        items-center
                                        gap-2
                                        text-blue-600
                                    ">
                                    <BookOpen class="h-4 w-4" />

                                    <span class="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                        ">
                                        Step-by-step guide
                                    </span>
                                </div>

                                <h3 class="
                                        mt-3
                                        text-2xl
                                        font-bold
                                        tracking-tight
                                        text-slate-900
                                    ">
                                    {{ selectedArticle.title }}
                                </h3>

                                <p class="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-slate-500
                                    ">
                                    {{ selectedArticle.description }}
                                </p>
                            </div>

                            <!-- Steps -->
                            <section class="
                                    mt-8
                                    border-t
                                    border-slate-100
                                    pt-7
                                ">
                                <h3 class="
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-slate-600
                                    ">
                                    How to do it
                                </h3>

                                <div class="mt-5 max-w-3xl">
                                    <div v-for="(
step, index
                                        ) in selectedArticle.steps" :key="index"
                                        class="relative flex gap-4 pb-7 last:pb-0">
                                        <!-- Connector -->
                                        <div v-if="
                                            index <
                                            selectedArticle.steps.length - 1
                                        " class="
                                                absolute
                                                left-3.75
                                                top-8
                                                h-full
                                                w-px
                                                bg-slate-200
                                            "></div>

                                        <!-- Number -->
                                        <div class="
                                                relative
                                                z-10
                                                flex
                                                h-8
                                                w-8
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-blue-100
                                                bg-blue-50
                                                text-xs
                                                font-bold
                                                text-blue-600
                                            ">
                                            {{ index + 1 }}
                                        </div>

                                        <!-- Step -->
                                        <div class="pt-1">
                                            <p class="
                                                    text-sm
                                                    leading-6
                                                    text-slate-600
                                                ">
                                                {{ step }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Complete -->
                            <div class="
                                    mt-8
                                    flex
                                    items-center
                                    gap-3
                                    rounded-lg
                                    border
                                    border-green-100
                                    bg-green-50
                                    px-4
                                    py-3
                                ">
                                <CheckCircle2 class="
                                        h-5
                                        w-5
                                        shrink-0
                                        text-green-600
                                    " />

                                <p class="
                                        text-sm
                                        text-green-700
                                    ">
                                    Follow these steps to complete
                                    this task.
                                </p>
                            </div>
                        </template>

                        <!-- ================================= -->
                        <!-- CATEGORY VIEW                      -->
                        <!-- ================================= -->

                        <template v-else>
                            <!-- Overview -->
                            <section>
                                <div class="
                                        flex
                                        items-center
                                        justify-between
                                    ">
                                    <h3 class="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-600
                                        ">
                                        Overview
                                    </h3>

                                    <span class="
                                            text-[10px]
                                            text-slate-400
                                        ">
                                        {{ props.category.title }} help
                                    </span>
                                </div>

                                <p class="
                                        mt-3
                                        max-w-3xl
                                        text-sm
                                        leading-6
                                        text-slate-600
                                    ">
                                    {{ props.category.overview }}
                                </p>
                            </section>

                            <!-- Articles -->
                            <section class="
                                    mt-8
                                    border-t
                                    border-slate-100
                                    pt-7
                                ">
                                <div class="
                                        flex
                                        items-end
                                        justify-between
                                    ">
                                    <div>
                                        <h3 class="
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-600
                                            ">
                                            Helpful guides
                                        </h3>

                                        <p class="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            ">
                                            Select a guide to see the
                                            steps required.
                                        </p>
                                    </div>

                                    <span class="
                                            text-[10px]
                                            text-slate-400
                                        ">
                                        {{ props.category.articles.length }}
                                        guides
                                    </span>
                                </div>

                                <div class="
                                        mt-5
                                        grid
                                        grid-cols-1
                                        gap-3
                                        md:grid-cols-2
                                    ">
                                    <button v-for="article in props.category.articles" :key="article.title"
                                        type="button" class="
                                            group
                                            flex
                                            min-h-20
                                            items-center
                                            justify-between
                                            gap-5
                                            rounded-lg
                                            border
                                            border-slate-200
                                            bg-white
                                            px-5
                                            py-4
                                            text-left
                                            transition
                                            hover:border-blue-200
                                            hover:bg-blue-50/40
                                            hover:shadow-sm
                                        " @click="openArticle(article)">
                                        <div>
                                            <span class="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-700
                                                    transition
                                                    group-hover:text-blue-600
                                                ">
                                                {{ article.title }}
                                            </span>

                                            <p class="
                                                    mt-1
                                                    text-xs
                                                    text-slate-400
                                                ">
                                                View step-by-step instructions
                                            </p>
                                        </div>

                                        <ArrowRight class="
                                                h-4
                                                w-4
                                                shrink-0
                                                text-slate-300
                                                transition
                                                group-hover:translate-x-0.5
                                                group-hover:text-blue-500
                                            " />
                                    </button>
                                </div>
                            </section>

                            <!-- Support -->
                            <section class="
                                    mt-8
                                    border-t
                                    border-slate-100
                                    pt-7
                                ">
                                <div class="
                                        flex
                                        items-center
                                        gap-3
                                        rounded-lg
                                        border
                                        border-blue-100
                                        bg-blue-50
                                        px-4
                                        py-3
                                    ">
                                    <LifeBuoy class="
                                            h-5
                                            w-5
                                            shrink-0
                                            text-blue-600
                                        " />

                                    <div>
                                        <p class="
                                                text-xs
                                                font-semibold
                                                text-blue-800
                                            ">
                                            Still need help?
                                        </p>

                                        <p class="
                                                mt-0.5
                                                text-[11px]
                                                text-blue-600
                                            ">
                                            Contact support if you can't
                                            find the answer you're looking for.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </template>
                    </div>

                    <!-- Footer -->
                    <div class="
                            flex
                            justify-between
                            border-t
                            border-slate-100
                            bg-slate-50
                            px-10
                            py-4
                        ">
                        <!-- Back -->
                        <button v-if="selectedArticle" type="button" class="
                                inline-flex
                                h-10
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-5
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                            " @click="backToArticles">
                            <ArrowLeft class="h-4 w-4" />

                            Back
                        </button>

                        <div v-else></div>

                        <!-- Close -->
                        <button type="button" class="
                                h-10
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-5
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                            " @click="close">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
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