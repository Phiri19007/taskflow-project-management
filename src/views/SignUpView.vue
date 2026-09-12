<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseLabel from '@/components/BaseLabel.vue'
import FormButton from '@/components/FormButton.vue'
import FormDivider from '@/components/FormDivider.vue'
import api from '@/services/api'
import RegisterInput from '@/components/RegisterInput.vue'
import {useToastStore} from '@/services/stores/toast.store'



const router = useRouter()
const toast = useToastStore()

import {
    Component
} from "lucide-vue-next";

const form = reactive({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
})

const state = reactive({
    loading: false,
    serverError: '',
})

const errors = reactive({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
})

function clearErrors() {
    state.serverError = ''

    errors.fullName = ''
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''
}

function validate() {
    clearErrors()

    let valid = true

    if (!form.fullName.trim()) {
        errors.fullName = 'Full name is required.'
        valid = false
    }

    if (!form.email.trim()) {
        errors.email = 'Email is required.'
        valid = false
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(form.email)) {
            errors.email = 'Please enter a valid email address.'
            valid = false
        }
    }

    if (!form.password) {
        errors.password = 'Password is required.'
        valid = false
    } else if (form.password.length < 8) {
        errors.password = 'Password must be at least 8 characters.'
        valid = false
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.'
        valid = false
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.'
        valid = false
    }

    if (!form.acceptedTerms) {
        state.serverError = 'You must accept the Terms of Service.'
        valid = false
    }

    return valid
}

async function register() {
    if (!validate()) {
        return
    }

    state.loading = true

    try {
        await api.post('/auth/register', {
            fullName: form.fullName,
            email: form.email,
            password: form.password,
        })

        toast.success('Account created successfully! Sign in to continue.')
        router.push('/signin')
    } catch (err: any) {
        if (err.response?.data?.message) {
            if (Array.isArray(err.response.data.message)) {
                state.serverError = err.response.data.message.join('\n')
            } else {
                state.serverError = err.response.data.message
            }
        } else {
            state.serverError = 'Something went wrong. Please try again.'
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

                <!-- background -->
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

                    <!-- CARD -->
                    <div class="bg-white border border-slate-200 shadow-2xl rounded-2xl p-10 space-y-8">

                        <!-- Header -->
                        <div class="space-y-2">
                            <h1 class="text-3xl font-semibold tracking-tight">
                                Create your account
                            </h1>
                            <p class="text-slate-600 text-sm leading-relaxed">
                                Start organizing your work with clarity and speed from day one.
                            </p>
                        </div>

                        <!-- Form -->
                        <form class="space-y-5" @submit.prevent="register">
                            <p v-if="state.serverError"
                                class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {{ state.serverError }}
                            </p>
                            <!-- FULL NAME -->
                            <div>
                                <BaseLabel text="Full name" />

                                <RegisterInput v-model="form.fullName" type="text" placeholder="John Doe" :class="[
                                    errors.fullName &&
                                    'border-red-500 focus:border-red-500 focus:ring-red-500'
                                ]" />

                                <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">
                                    {{ errors.fullName }}
                                </p>
                            </div>

                            <!-- EMAIL -->
                            <div>
                                <BaseLabel text="Email" />

                                <RegisterInput v-model="form.email" type="email" placeholder="you@example.com" :class="[
                                    errors.email &&
                                    'border-red-500 focus:border-red-500 focus:ring-red-500'
                                ]" />

                                <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                                    {{ errors.email }}
                                </p>
                            </div>

                            <!-- PASSWORD -->
                            <div>
                                <BaseLabel text="Password" />

                                <RegisterInput v-model="form.password" type="password" placeholder="••••••••" :class="[
                                    errors.password &&
                                    'border-red-500 focus:border-red-500 focus:ring-red-500'
                                ]" />

                                <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                                    {{ errors.password }}
                                </p>
                            </div>

                            <!-- CONFIRM PASSWORD -->
                            <div>
                                <BaseLabel text="Confirm Password" />

                                <RegisterInput v-model="form.confirmPassword" type="password" placeholder="••••••••"
                                    :class="[
                                        errors.confirmPassword &&
                                        'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    ]" />

                                <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
                                    {{ errors.confirmPassword }}
                                </p>
                            </div>


                            <!-- TERMS CHECKBOX -->
                            <div class="flex items-start gap-3">
                                <input id="terms" type="checkbox" v-model="form.acceptedTerms"
                                    class="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />

                                <label for="terms" class="text-sm text-slate-600 leading-relaxed">
                                    I agree to the
                                    <RouterLink to="/terms" class="text-slate-900 font-medium hover:underline">
                                        Terms of Service
                                    </RouterLink>
                                    and
                                    <RouterLink to="/privacy" class="text-slate-900 font-medium hover:underline">
                                        Privacy Policy
                                    </RouterLink>.
                                </label>
                            </div>

                            <!-- PRIMARY BUTTON -->
                            <FormButton type="submit" variant="primary" :disabled="!form.acceptedTerms">
                                Create account
                            </FormButton>

                            <!-- DIVIDER -->
                            <FormDivider />

                            <!-- GOOGLE BUTTON -->
                            <FormButton type="button" variant="secondary" :disabled="!form.acceptedTerms">
                                Continue with Google
                            </FormButton>

                        </form>

                        <!-- Footer -->
                        <p class="text-sm text-slate-600 text-center">
                            Already have an account?
                            <RouterLink to="/signin" class="text-slate-900 font-medium hover:underline">
                                Sign in
                            </RouterLink>
                        </p>

                    </div>
                </div>
            </div>
            <!-- RIGHT: HERO PANEL (matched styling to sign-in) -->
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
                        Join TaskFlow
                    </div>

                    <!-- headline -->
                    <h2 class="text-5xl font-semibold tracking-tight leading-[1.1]">
                        Build structure into your work from day one
                    </h2>

                    <!-- subtext -->
                    <p class="text-slate-300 text-base leading-relaxed">
                        Create your workspace in seconds and start organizing tasks, projects, and teams without
                        friction.
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