<script setup lang="ts">
import BaseInput from '@/components/BaseInput.vue'
import FormButton from '@/components/FormButton.vue'
import BaseLabel from '@/components/BaseLabel.vue'
import { RouterLink, useRouter } from 'vue-router'
import { reactive } from 'vue'
import api from '@/services/api'
import{useToastStore} from '@/services/stores/toast.store'

import {
    Component
} from "lucide-vue-next";

const router = useRouter()
const toast = useToastStore()

const form = reactive({
    email: '',
    password: '',
})

const state = reactive({
    loading: false,
    error: '',
})

const submit = async () => {
    state.error = ''

    if (!form.email || !form.password) {
        state.error = 'Please enter your email and password.'
        return
    }

    try {
        state.loading = true

        await api.post('/auth/login', {
            email: form.email,
            password: form.password,
        })
        toast.success('Welcome back! You’re now signed in.')
        router.push('/dashboard')

    } catch (err: any) {
        // Do not expose which field is incorrect
        if (err.response?.status === 401) {
            state.error = 'Invalid email or password.'
        } else {
            state.error = 'Something went wrong. Please try again.'
        }
    } finally {
        state.loading = false
    }
}
</script>
<template>
    <main class="bg-slate-100 text-slate-900 antialiased overflow-hidden">
        <div class="min-h-screen grid lg:grid-cols-2 relative">
            <!-- GLOBAL AMBIENT BACKGROUND -->
            <div class="absolute inset-0 pointer-events-none">
                <div class="absolute -top-40 -left-40 w-150 h-150 bg-white rounded-full blur-3xl opacity-70"></div>
                <div class="absolute -bottom-50 -right-30 w-175 h-175 bg-slate-200 rounded-full blur-3xl opacity-50">
                </div>
            </div>



            <!-- LEFT: FORM -->
            <div class="flex items-center justify-center px-6 py-16 relative">

                <!-- subtle depth layer -->
                <div class="absolute inset-0 bg-linear-to-br from-white via-slate-50 to-slate-100"></div>
                <div class="absolute top-8 left-8">

                    <RouterLink to="/" class="flex items-center gap-3">

                        <div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <Component class="w-5 h-5" />
                        </div>

                        <span class="font-bold text-lg">
                            TaskFlow
                        </span>

                    </RouterLink>

                </div>
                <div class="relative w-full max-w-md">

                    <!-- CARD (more refined elevation) -->
                    <div class="bg-white border border-slate-200 shadow-2xl rounded-2xl p-10 space-y-8">

                        <!-- Header -->
                        <div class="space-y-2">
                            <h1 class="text-3xl font-semibold tracking-tight">
                                Welcome back
                            </h1>
                            <p class="text-slate-600 text-sm leading-relaxed">
                                Sign in to continue managing your tasks with clarity and speed.
                            </p>
                        </div>

                        <form class="space-y-5" @submit.prevent="submit">

                            <!-- SERVER ERROR -->
                            <p v-if="state.error"
                                class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {{ state.error }}
                            </p>

                            <!-- Email -->
                            <div>
                                <BaseLabel text="Email" />

                                <BaseInput v-model="form.email" type="email" placeholder="you@example.com" :class="[
                                    state.error &&
                                    'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                ]" />
                            </div>


                            <!-- Password -->
                            <div>
                                <div class="flex items-center justify-left">
                                    <BaseLabel text="Password" />

                                    
                                </div>

                                <BaseInput v-model="form.password" type="password" placeholder="••••••••" :class="[
                                    state.error &&
                                    'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                ]" />
                            </div>


                            <!-- Submit -->
                            <FormButton type="submit" variant="primary" :disabled="state.loading">
                                {{ state.loading ? 'Signing in...' : 'Sign in' }}
                            </FormButton>

                        </form>

                        <p class="text-sm text-slate-600 text-center">
                            Don’t have an account?
                            <RouterLink to="/signup" class="text-slate-900 font-medium hover:underline">
                                Create one
                            </RouterLink>
                        </p>

                    </div>
                </div>
            </div>
            <!-- RIGHT: HERO PANEL -->
            <div class="hidden lg:flex items-center justify-center bg-slate-900 text-white relative overflow-hidden">

                <!-- unified glow system -->
                <div class="absolute inset-0">
                    <div class="absolute -top-30 left-1/3 w-162.5 h-162.5 bg-indigo-500/10 blur-3xl rounded-full"></div>
                    <div class="absolute -bottom-45 -right-30 w-150 h-150 bg-slate-700/40 blur-3xl rounded-full"></div>
                </div>

                <div class="relative max-w-md text-left px-10 space-y-10">

                    <!-- badge -->
                    <div
                        class="inline-flex items-center text-xs text-slate-300 border border-slate-700 px-3 py-1 rounded-full">
                        Secure workspace
                    </div>

                    <!-- headline (better hierarchy) -->
                    <h2 class="text-5xl font-semibold tracking-tight leading-[1.1]">
                        Work moves faster when everything is in one place
                    </h2>

                    <!-- subtext -->
                    <p class="text-slate-300 text-base leading-relaxed">
                        TaskFlow keeps your tasks, projects, and team aligned — without friction or clutter.
                    </p>

                    <!-- footer cue -->
                    <div class="pt-6 text-xs text-slate-500">
                        Trusted by modern teams worldwide
                    </div>

                </div>
            </div>
        </div>
    </main>

</template>