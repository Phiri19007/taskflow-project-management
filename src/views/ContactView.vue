<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseLabel from '@/components/BaseLabel.vue'
import FormButton from '@/components/FormButton.vue'

const name = ref('')
const email = ref('')
const message = ref('')
</script>

<template>
    <main class="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden">

        <!-- background glow -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-150 bg-slate-200/40 blur-3xl rounded-full">
            </div>
        </div>

        <div class="relative max-w-3xl mx-auto px-6 py-24">

            <!-- Header -->
            <div class="text-center mb-12 space-y-3">
                <h1 class="text-4xl font-semibold tracking-tight text-slate-900">
                    Contact us
                </h1>

                <p class="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Have a question, feedback, or need help? We usually respond within 24 hours.
                </p>
            </div>

            <!-- Card -->
            <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">

                <form class="space-y-6">

                    <!-- Name -->
                    <div>
                        <BaseLabel text="Name" />
                        <BaseInput v-model="name" placeholder="John Doe" />
                    </div>

                    <!-- Email -->
                    <div>
                        <BaseLabel text="Email" />
                        <BaseInput v-model="email" type="email" placeholder="you@example.com" />
                    </div>

                    <!-- Message -->
                    <div>
                        <BaseLabel text="Message" />
                        <textarea v-model="message" rows="6" placeholder="Tell us how we can help..." class="mt-2 w-full px-4 py-3 border border-slate-200 rounded-xl
                     text-sm text-slate-900 placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900
                     transition resize-none" />
                    </div>

                    <!-- Button -->
                    <FormButton type="submit" variant="primary">
                        Send message
                    </FormButton>

                </form>

            </div>

            <!-- footer hint -->
            <p class="text-center text-xs text-slate-400 mt-6">
                We respect your privacy. Your information will never be shared.
            </p>

        </div>

    </main>
</template>