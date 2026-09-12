<script setup lang="ts">
import { RouterLink } from 'vue-router'

</script>
<template>
    <main
        class="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 via-white to-slate-50 text-slate-900">

        <div class="text-center max-w-md px-6">

            <!-- Number -->
            <h1 class="text-7xl font-semibold tracking-tight text-slate-900">
                404
            </h1>

            <!-- Title -->
            <h2 class="mt-4 text-2xl font-semibold">
                Page not found
            </h2>

            <!-- Description -->
            <p class="mt-3 text-sm text-slate-500 leading-relaxed">
                The page you’re looking for doesn’t exist or has been moved.
            </p>

            <!-- Actions -->
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">

                <RouterLink to="/"
                    class="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">
                    Go home
                </RouterLink>

                <RouterLink to="/"
                    class="px-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 hover:bg-slate-50 transition">
                    Go back
                </RouterLink>

            </div>

            <!-- Small hint -->
            <p class="mt-6 text-xs text-slate-400">
                If you think this is a mistake, check the URL and try again.
            </p>

        </div>

    </main>
</template>