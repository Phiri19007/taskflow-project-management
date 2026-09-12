<script setup lang="ts">

import {
    User,
    Mail,
    CalendarDays,
    Pencil,
    Check,
    X,
    Loader2,
    ShieldCheck,
    Upload,
    Image as ImageIcon,
} from "lucide-vue-next";

import {
    computed,
    ref,
    watch,
    onBeforeUnmount,
} from "vue";

import {
    useAuthStore,
} from "@/services/stores/auth.store";

import {
    useToastStore,
} from "@/services/stores/toast.store";


const authStore =
    useAuthStore();


const toast =
    useToastStore();


/*
|--------------------------------------------------------------------------
| Profile state
|--------------------------------------------------------------------------
*/

const isEditing =
    ref(false);

const isSaving =
    ref(false);

const fullName =
    ref("");

const profession =
    ref("");


/*
|--------------------------------------------------------------------------
| Avatar state
|--------------------------------------------------------------------------
*/

const isAvatarDialogOpen =
    ref(false);

const isAvatarUploading =
    ref(false);

const selectedAvatar =
    ref<File | null>(null);

const avatarPreview =
    ref<string | null>(null);

const isDragging =
    ref(false);

const fileInput =
    ref<HTMLInputElement | null>(null);


/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

const user =
    computed(() =>
        authStore.user
    );


/*
|--------------------------------------------------------------------------
| Avatar initials
|--------------------------------------------------------------------------
*/

const initials =
    computed(() => {

        if (!user.value?.fullName) {
            return "U";
        }

        return user.value.fullName
            .trim()
            .split(/\s+/)
            .map(name =>
                name.charAt(0)
            )
            .slice(0, 2)
            .join("")
            .toUpperCase();

    });


/*
|--------------------------------------------------------------------------
| Format date
|--------------------------------------------------------------------------
*/

function formatDate(
    date: string | null | undefined
) {

    if (!date) {
        return "Not available";
    }

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric",
        }
    );

}


/*
|--------------------------------------------------------------------------
| Start profile editing
|--------------------------------------------------------------------------
*/

function startEditing() {

    if (!user.value) {
        return;
    }

    fullName.value =
        user.value.fullName;

    /*
     * If your User type has profession,
     * you can uncomment this:
     *
     * profession.value =
     *     user.value.profession ?? "";
     */

    profession.value = "";

    isEditing.value = true;

}


/*
|--------------------------------------------------------------------------
| Cancel profile editing
|--------------------------------------------------------------------------
*/

function cancelEditing() {

    isEditing.value = false;

    fullName.value = "";

    profession.value = "";

}


/*
|--------------------------------------------------------------------------
| Save profile
|--------------------------------------------------------------------------
*/

async function saveProfile() {

    if (!user.value) {
        return;
    }

    const trimmedName =
        fullName.value.trim();

    const trimmedProfession =
        profession.value.trim();


    if (!trimmedName) {

        toast.error(
            "Full name is required."
        );

        return;

    }


    try {

        isSaving.value = true;


        await authStore.updateProfile({

            fullName:
                trimmedName,
        });


        isEditing.value = false;


        toast.success(
            "Profile updated successfully."
        );


    } catch (error) {

        console.error(
            "Failed to update profile:",
            error
        );


        toast.error(
            "Failed to update your profile."
        );

    } finally {

        isSaving.value = false;

    }

}


/*
|--------------------------------------------------------------------------
| Open avatar dialog
|--------------------------------------------------------------------------
*/

function openAvatarDialog() {

    if (!isEditing.value) {
        return;
    }

    selectedAvatar.value = null;
    avatarPreview.value = null;
    isDragging.value = false;

    isAvatarDialogOpen.value = true;
}


/*
|--------------------------------------------------------------------------
| Close avatar dialog
|--------------------------------------------------------------------------
*/

function closeAvatarDialog() {

    if (isAvatarUploading.value) {
        return;
    }

    clearAvatarSelection();

    isAvatarDialogOpen.value = false;

}


/*
|--------------------------------------------------------------------------
| Clear selected avatar
|--------------------------------------------------------------------------
*/

function clearAvatarSelection() {

    if (avatarPreview.value) {

        URL.revokeObjectURL(
            avatarPreview.value
        );

    }

    selectedAvatar.value = null;

    avatarPreview.value = null;

    isDragging.value = false;


    if (fileInput.value) {
        fileInput.value.value = "";
    }

}


/*
|--------------------------------------------------------------------------
| Validate avatar
|--------------------------------------------------------------------------
*/

function validateAvatar(
    file: File
) {

    /*
     * Only images.
     */
    if (!file.type.startsWith("image/")) {

        toast.error(
            "Please select an image file."
        );

        return false;

    }


    /*
     * 5MB limit.
     */
    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        toast.error(
            "Image must be smaller than 5MB."
        );

        return false;

    }


    return true;

}


/*
|--------------------------------------------------------------------------
| Select avatar
|--------------------------------------------------------------------------
*/

function selectAvatar(
    file: File | undefined
) {

    if (!file) {
        return;
    }


    if (!validateAvatar(file)) {
        return;
    }


    /*
     * Remove previous preview.
     */
    if (avatarPreview.value) {

        URL.revokeObjectURL(
            avatarPreview.value
        );

    }


    selectedAvatar.value =
        file;


    avatarPreview.value =
        URL.createObjectURL(file);

}


/*
|--------------------------------------------------------------------------
| File input
|--------------------------------------------------------------------------
*/

function handleFileChange(
    event: Event
) {

    const input =
        event.target as HTMLInputElement;

    const file =
        input.files?.[0];

    selectAvatar(file);

}


/*
|--------------------------------------------------------------------------
| Open file manager
|--------------------------------------------------------------------------
*/

function openFileManager() {

    fileInput.value?.click();

}


/*
|--------------------------------------------------------------------------
| Drag events
|--------------------------------------------------------------------------
*/

function handleDragOver(
    event: DragEvent
) {

    event.preventDefault();

    isDragging.value = true;

}


function handleDragLeave(
    event: DragEvent
) {

    event.preventDefault();

    isDragging.value = false;

}


function handleDrop(
    event: DragEvent
) {

    event.preventDefault();

    isDragging.value = false;


    const file =
        event.dataTransfer?.files?.[0];

    selectAvatar(file);

}


/*
|--------------------------------------------------------------------------
| Upload avatar
|--------------------------------------------------------------------------
*/

async function uploadAvatar() {

    if (!selectedAvatar.value) {

        toast.error(
            "Please select an image first."
        );

        return;

    }


    try {

        isAvatarUploading.value = true;


        await authStore.updateAvatar(
            selectedAvatar.value
        );


        toast.success(
            "Profile photo updated successfully."
        );


        clearAvatarSelection();

        isAvatarDialogOpen.value = false;


    } catch (error) {

        console.error(
            "Failed to upload avatar:",
            error
        );


        toast.error(
            "Failed to update your profile photo."
        );

    } finally {

        isAvatarUploading.value = false;

    }

}


/*
|--------------------------------------------------------------------------
| Keep form synchronized
|--------------------------------------------------------------------------
*/

watch(
    () => authStore.user,
    currentUser => {

        if (
            !currentUser ||
            isEditing.value
        ) {
            return;
        }


        fullName.value =
            currentUser.fullName;

    },
    {
        immediate: true,
    }
);


/*
|--------------------------------------------------------------------------
| Cleanup preview URL
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {

    if (avatarPreview.value) {

        URL.revokeObjectURL(
            avatarPreview.value
        );

    }

});

</script>


<template>

    <main class="
            flex-1
            overflow-y-auto
            h-full
            bg-[#f4f7fa]
            p-6
            pt-0
            md:p-8
            lg:p-10
        ">

        <div class="mx-auto w-full max-w-4xl">


            <!-- ================================================= -->
            <!-- HEADER -->
            <!-- ================================================= -->

            <div class="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-200/60
                    pb-5
                ">

                <div>

                    <h1 class="
                            flex
                            items-center
                            gap-2
                            text-xl
                            font-bold
                            tracking-tight
                            text-slate-900
                        ">

                        <User class="h-5 w-5 text-slate-700" />

                        Profile

                    </h1>


                    <p class="
                            mt-1
                            text-[12px]
                            font-medium
                            text-slate-400
                        ">
                        Manage your personal information
                        and account details.
                    </p>

                </div>


                <!-- Edit profile -->

                <button v-if="!isEditing" type="button" class="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-[#111111]
                        px-4
                        py-2
                        text-[11px]
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-slate-800
                    " @click="startEditing">

                    <Pencil class="h-3.5 w-3.5" />

                    Edit Profile

                </button>


                <!-- Editing actions -->

                <div v-else class="flex items-center gap-2">

                    <button type="button" class="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2
                            text-[11px]
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                        " :disabled="isSaving" @click="cancelEditing">

                        <X class="h-3.5 w-3.5" />

                        Cancel

                    </button>


                    <button type="button" class="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#111111]
                            px-4
                            py-2
                            text-[11px]
                            font-bold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-slate-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        " :disabled="isSaving" @click="saveProfile">

                        <Loader2 v-if="isSaving" class="h-3.5 w-3.5 animate-spin" />

                        <Check v-else class="h-3.5 w-3.5" />

                        {{
                            isSaving
                                ? "Saving..."
                                : "Save Changes"
                        }}

                    </button>

                </div>

            </div>



            <!-- ================================================= -->
            <!-- PROFILE CARD -->
            <!-- ================================================= -->

            <section v-if="user" class="
                    mt-6
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200/70
                    bg-white
                    shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]
                ">


                <!-- ================================================= -->
                <!-- IDENTITY -->
                <!-- ================================================= -->

                <div class="
                        flex
                        flex-col
                        gap-5
                        border-b
                        border-slate-100
                        p-6
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        md:p-7
                    ">

                    <div class="
                            flex
                            items-center
                            gap-4
                        ">


                        <!-- ============================= -->
                        <!-- AVATAR -->
                        <!-- ============================= -->

                        <div class="
                                relative
                                h-16
                                w-16
                                shrink-0
                            ">

                            <!-- Avatar -->

                            <div class="
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-2xl
                                    bg-blue-50
                                    text-lg
                                    font-bold
                                    text-blue-600
                                ">

                                <img v-if="user.avatar" :src="user.avatar" :alt="user.fullName" class="
                                        h-full
                                        w-full
                                        object-cover
                                    " />

                                <span v-else>
                                    {{ initials }}
                                </span>

                            </div>


                            <!-- ============================= -->
                            <!-- AVATAR EDIT BUTTON -->
                            <!-- ============================= -->

                            <button v-if="isEditing" type="button" class="
        absolute
        -bottom-1.5
        -right-1.5
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-full
        border-2
        border-white
        bg-[#111111]
        text-white
        shadow-md
        transition
        hover:scale-105
        hover:bg-slate-700
    " title="Change profile photo" aria-label="Change profile photo" @click="openAvatarDialog">
                                <Pencil class="h-3.5 w-3.5" />
                            </button>

                        </div>


                        <!-- Name -->

                        <div>

                            <h2 class="
                                    text-lg
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                ">
                                {{ user.fullName }}
                            </h2>


                            <p class="
                                    mt-0.5
                                    text-xs
                                    text-slate-400
                                ">
                                {{ user.email }}
                            </p>

                        </div>

                    </div>


                    <!-- Account status -->

                    <div class="
                            inline-flex
                            w-fit
                            items-center
                            gap-2
                            rounded-lg
                            bg-emerald-50
                            px-3
                            py-2
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-emerald-600
                        ">

                        <ShieldCheck class="h-3.5 w-3.5" />

                        Active Account

                    </div>

                </div>



                <!-- ================================================= -->
                <!-- INFORMATION -->
                <!-- ================================================= -->

                <div class="p-6 md:p-7">

                    <div class="
                            mb-5
                            flex
                            items-center
                            justify-between
                        ">

                        <div>

                            <h3 class="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-700
                                ">
                                Personal Information
                            </h3>


                            <p class="
                                    mt-1
                                    text-[11px]
                                    text-slate-400
                                ">
                                Your basic account information.
                            </p>

                        </div>

                    </div>


                    <!-- Fields -->

                    <div class="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                        ">


                        <!-- Full name -->

                        <div class="
                                rounded-xl
                                border
                                border-slate-100
                                bg-slate-50/60
                                p-4
                            ">

                            <div class="
                                    flex
                                    items-center
                                    gap-2
                                ">

                                <User class="
                                        h-4
                                        w-4
                                        text-slate-400
                                    " />

                                <label class="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                    Full Name
                                </label>

                            </div>


                            <input v-if="isEditing" v-model="fullName" type="text" autocomplete="name" class="
                                    mt-3
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-slate-800
                                    outline-none
                                    transition
                                    placeholder:text-slate-300
                                    focus:border-slate-400
                                    focus:ring-2
                                    focus:ring-slate-100
                                " placeholder="Enter your full name" />


                            <p v-else class="
                                    mt-3
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                ">
                                {{ user.fullName }}
                            </p>

                        </div>



                        <!-- Email -->

                        <div class="
                                rounded-xl
                                border
                                border-slate-100
                                bg-slate-50/60
                                p-4
                            ">

                            <div class="
                                    flex
                                    items-center
                                    gap-2
                                ">

                                <Mail class="
                                        h-4
                                        w-4
                                        text-slate-400
                                    " />

                                <label class="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                    Email Address
                                </label>

                            </div>


                            <p class="
                                    mt-3
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                ">
                                {{ user.email }}
                            </p>


                            <p class="
                                    mt-1
                                    text-[10px]
                                    text-slate-400
                                ">
                                Email address cannot be changed here.
                            </p>

                        </div>



                        <!-- Member Since -->

                        <div class="
                                rounded-xl
                                border
                                border-slate-100
                                bg-slate-50/60
                                p-4
                            ">

                            <div class="
                                    flex
                                    items-center
                                    gap-2
                                ">

                                <CalendarDays class="
                                        h-4
                                        w-4
                                        text-slate-400
                                    " />

                                <span class="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                    Member Since
                                </span>

                            </div>


                            <p class="
                                    mt-3
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                ">
                                {{
                                    formatDate(
                                        user.createdAt
                                    )
                                }}
                            </p>

                        </div>

                    </div>

                </div>

            </section>



            <!-- ================================================= -->
            <!-- ACCOUNT NOTE -->
            <!-- ================================================= -->

            <div v-if="user" class="
                    mt-4
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-slate-200/70
                    bg-white
                    px-4
                    py-3.5
                ">

                <ShieldCheck class="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-slate-400
                    " />


                <div>

                    <p class="
                            text-[11px]
                            font-semibold
                            text-slate-600
                        ">
                        Account information
                    </p>


                    <p class="
                            mt-0.5
                            text-[10px]
                            leading-5
                            text-slate-400
                        ">
                        Keep your profile information up to date
                        so your workspace members can easily identify you.
                    </p>

                </div>

            </div>



            <!-- ================================================= -->
            <!-- LOADING -->
            <!-- ================================================= -->

            <div v-else class="
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200/70
                    bg-white
                    py-20
                ">

                <div class="
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-medium
                        text-slate-400
                    ">

                    <Loader2 class="h-4 w-4 animate-spin" />

                    Loading profile...

                </div>

            </div>

        </div>



        <!-- ===================================================== -->
        <!-- AVATAR UPLOAD DIALOG -->
        <!-- ===================================================== -->

<Teleport to="body">

    <Transition name="fade">

        <div
            v-if="isAvatarDialogOpen"
            class="
                fixed
                inset-0
                z-100
                flex
                items-center
                justify-center
                bg-slate-950/40
                p-5
                backdrop-blur-sm
            "
            @click.self="closeAvatarDialog"
        >

            <div
                class="
                    w-full
                    max-w-xl
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
                "
            >

                <!-- ================================================= -->
                <!-- HEADER -->
                <!-- ================================================= -->

                <div
                    class="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        px-7
                        py-5
                    "
                >

                    <div>

                        <h2
                            class="
                                text-base
                                font-bold
                                text-slate-900
                            "
                        >
                            Change profile photo
                        </h2>

                        <p
                            class="
                                mt-1
                                text-[11px]
                                text-slate-400
                            "
                        >
                            {{
                                selectedAvatar
                                    ? "Review your photo before uploading."
                                    : "Upload a clear photo for your profile."
                            }}
                        </p>

                    </div>


                    <!-- Close -->

                    <button
                        type="button"
                        class="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                        :disabled="isAvatarUploading"
                        @click="closeAvatarDialog"
                    >
                        <X class="h-4 w-4" />
                    </button>

                </div>


                <!-- ================================================= -->
                <!-- CONTENT -->
                <!-- ================================================= -->

                <div class="p-7">

                    <!-- Hidden file input -->

                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileChange"
                    />


                    <!-- ================================================= -->
                    <!-- SELECTED IMAGE -->
                    <!-- ================================================= -->

                    <div
                        v-if="avatarPreview"
                        class="flex flex-col items-center"
                    >

                        <!-- Image preview -->

                        <div
                            class="
                                relative
                                h-52
                                w-52
                                sm:h-60
                                sm:w-60
                            "
                        >

                            <div
                                class="
                                    h-full
                                    w-full
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    shadow-sm
                                "
                            >

                                <img
                                    :src="avatarPreview"
                                    alt="Avatar preview"
                                    class="
                                        h-full
                                        w-full
                                        object-cover
                                    "
                                />

                            </div>


                            <!-- ================================================= -->
                            <!-- REMOVE IMAGE BUTTON -->
                            <!-- ================================================= -->

                            <button
                                type="button"
                                class="
                                    absolute
                                    -right-3
                                    -top-3
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white
                                    bg-slate-900
                                    text-white
                                    shadow-lg
                                    transition
                                    hover:scale-105
                                    hover:bg-red-500
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-slate-300
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                                :disabled="isAvatarUploading"
                                title="Remove selected image"
                                @click="clearAvatarSelection"
                            >
                                <X class="h-4 w-4" />
                            </button>

                        </div>


                        <!-- Selected file information -->

                        <div
                            v-if="selectedAvatar"
                            class="
                                mt-5
                                w-full
                                max-w-sm
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                px-4
                                py-3
                            "
                        >

                            <div
                                class="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >

                                <div class="min-w-0">

                                    <p
                                        class="
                                            truncate
                                            text-xs
                                            font-semibold
                                            text-slate-700
                                        "
                                    >
                                        {{ selectedAvatar.name }}
                                    </p>

                                    <p
                                        class="
                                            mt-0.5
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        {{
                                            (
                                                selectedAvatar.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)
                                        }}
                                        MB
                                    </p>

                                </div>


                                <!-- Selected indicator -->

                                <div
                                    class="
                                        flex
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-emerald-50
                                        text-emerald-600
                                    "
                                >
                                    <svg
                                        class="h-3.5 w-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                    >
                                        <path
                                            d="m5 12 4 4L19 6"
                                        />
                                    </svg>
                                </div>

                            </div>

                        </div>


                        <!-- Change instruction -->

                        <p
                            class="
                                mt-4
                                text-center
                                text-[10px]
                                text-slate-400
                            "
                        >
                            Remove the current image to choose
                            a different photo.
                        </p>

                    </div>


                    <!-- ================================================= -->
                    <!-- IMAGE SELECTOR -->
                    <!-- ================================================= -->

                    <div
                        v-else
                        class="
                            rounded-2xl
                            border-2
                            border-dashed
                            p-10
                            text-center
                            transition
                        "
                        :class="
                            isDragging
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                        "
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                        @drop="handleDrop"
                    >

                        <!-- Icon -->

                        <div
                            class="
                                mx-auto
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-xl
                                bg-white
                                text-slate-400
                                shadow-sm
                            "
                        >

                            <ImageIcon class="h-6 w-6" />

                        </div>


                        <!-- Title -->

                        <h3
                            class="
                                mt-4
                                text-sm
                                font-bold
                                text-slate-800
                            "
                        >
                            {{
                                isDragging
                                    ? "Drop your image here"
                                    : "Choose a profile photo"
                            }}
                        </h3>


                        <!-- Description -->

                        <p
                            class="
                                mx-auto
                                mt-2
                                max-w-md
                                text-[11px]
                                leading-5
                                text-slate-400
                            "
                        >
                            Open your file manager and select an
                            image, or drag and drop it here.
                        </p>


                        <!-- File button -->

                        <button
                            type="button"
                            class="
                                mt-5
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-[#111111]
                                px-5
                                py-2.5
                                text-[11px]
                                font-bold
                                text-white
                                transition
                                hover:bg-slate-800
                            "
                            @click="openFileManager"
                        >

                            <Upload class="h-3.5 w-3.5" />

                            Open File Manager

                        </button>


                        <!-- Supported formats -->

                        <p
                            class="
                                mt-3
                                text-[10px]
                                text-slate-400
                            "
                        >
                            JPG, PNG, GIF or WebP · Max 5MB
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- FOOTER -->
                <!-- ================================================= -->

                <div
                    class="
                        flex
                        items-center
                        justify-between
                        gap-2
                        border-t
                        border-slate-100
                        bg-slate-50
                        px-7
                        py-4
                    "
                >

                    <!-- Cancel -->

                    <button
                        type="button"
                        class="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2.5
                            text-[11px]
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-100
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                        :disabled="isAvatarUploading"
                        @click="closeAvatarDialog"
                    >

                        <X class="h-3.5 w-3.5" />

                        Cancel

                    </button>


                    <!-- Upload -->

                    <button
                        type="button"
                        class="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#111111]
                            px-5
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-slate-800
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                        :disabled="
                            !selectedAvatar ||
                            isAvatarUploading
                        "
                        @click="uploadAvatar"
                    >

                        <Loader2
                            v-if="isAvatarUploading"
                            class="
                                h-3.5
                                w-3.5
                                animate-spin
                            "
                        />

                        <Upload
                            v-else
                            class="h-3.5 w-3.5"
                        />

                        {{
                            isAvatarUploading
                                ? "Uploading..."
                                : "Upload"
                        }}

                    </button>

                </div>

            </div>

        </div>

    </Transition>

</Teleport>


    </main>

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