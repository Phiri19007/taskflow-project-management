<script setup lang="ts">

import { reactive } from "vue";
import { X, FolderKanban } from "lucide-vue-next";

import { ProjectStatus } from "@/types/project";


const open = defineModel<boolean>("open");


const emit = defineEmits<{
    created: [
        project: {
            name: string;
            description: string | null;
            status: ProjectStatus;
            startDate: string | null;
            endDate: string | null;
        }
    ];
}>();



const form = reactive({

    name: "",

    description: "",

    startDate: "",

    endDate: "",

});



function close() {

    form.name = "";
    form.description = "";
    form.startDate = "";
    form.endDate = "";

    open.value = false;

}



function createProject() {


    if (!form.name.trim()) {
        return;
    }



    emit(
        "created",
        {

            name: form.name.trim(),


            description:
                form.description.trim()
                    ? form.description.trim()
                    : null,


            // all new projects are active
            status: ProjectStatus.ACTIVE,


            startDate:
                form.startDate || null,


            endDate:
                form.endDate || null,

        }
    );


    close();

}



</script>



<template>

<Transition name="fade">

<div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-6"
>


    <div
        class="
            w-full
            max-w-4xl
            bg-white
            rounded-xl
            border
            border-slate-200
            shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
            overflow-hidden
        "
    >


        <!-- Header -->

        <div
            class="flex items-center justify-between px-10 py-6 border-b border-slate-100"
        >

            <div class="flex items-center gap-4">


                <div
                    class="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center"
                >

                    <FolderKanban
                        class="w-6 h-6 text-white"
                    />

                </div>



                <div>

                    <h2
                        class="text-lg font-bold text-slate-900"
                    >
                        Create New Project
                    </h2>


                    <p
                        class="text-sm text-slate-500 mt-1"
                    >
                        Add a new project to your workspace.
                    </p>


                </div>


            </div>



            <button
                @click="close"
                class="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-100 transition"
            >

                <X
                    class="w-5 h-5 text-slate-500"
                />

            </button>


        </div>





       <!-- Form -->

<div
    class="px-10 py-8 space-y-6"
>


    <!-- Project Name -->

    <div>

        <label
            class="text-xs font-semibold text-slate-600 uppercase tracking-wide"
        >
            Project Name
        </label>


        <input
            v-model="form.name"
            type="text"
            placeholder="Website redesign"
            class="
                mt-2
                w-full
                h-12
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





    <!-- Description -->

    <div>

        <label
            class="text-xs font-semibold text-slate-600 uppercase tracking-wide"
        >
            Description
        </label>


        <textarea
            v-model="form.description"
            rows="5"
            placeholder="Describe the project goals..."
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
                resize-none
                outline-none
                transition
                focus:border-slate-900
                focus:bg-white
                focus:ring-4
                focus:ring-slate-900/5
            "
        />


    </div>






    <!-- Dates -->

    <div
        class="grid grid-cols-2 gap-5"
    >


        <div>

            <label
                class="text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
                Start Date
            </label>


            <input
                v-model="form.startDate"
                type="date"
                class="
                    mt-2
                    w-full
                    h-12
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-sm
                    outline-none
                    focus:border-slate-900
                "
            />


        </div>





        <div>

            <label
                class="text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
                End Date
            </label>


            <input
                v-model="form.endDate"
                type="date"
                class="
                    mt-2
                    w-full
                    h-12
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-sm
                    outline-none
                    focus:border-slate-900
                "
            />


        </div>


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

        <div
            class="h-2 w-2 rounded-full bg-blue-600"
        ></div>


        <p
            class="text-sm text-blue-700"
        >
            New projects are automatically created as active.
        </p>


    </div>


</div>

        <!-- Footer -->

        <div
            class="flex justify-between gap-3 px-10 py-5 border-t border-slate-100 bg-slate-50"
        >

            <button
                @click="close"
                class="
                    h-11
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
                @click="createProject"
                class="
                    h-11
                    px-6
                    rounded-lg
                    bg-slate-900
                    text-white
                    text-sm
                    font-semibold
                    hover:bg-black
                    transition
                    shadow-sm
                "
            >
                Create Project
            </button>


        </div>


    </div>


</div>

</Transition>

</template>


<style scoped>

.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s ease;
}


.fade-enter-from,
.fade-leave-to {
    opacity:0;
}

</style>