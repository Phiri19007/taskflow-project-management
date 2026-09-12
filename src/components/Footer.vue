<script setup lang="ts">
import {RouterLink} from 'vue-router'

</script>
<template>
    <!-- FOOTER -->
    <footer class="bg-slate-100 border-t border-slate-200">
        <div
            class="max-w-6xl mx-auto px-6 py-12 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 TaskFlow. All rights reserved.</p>
            <div class="space-x-6">
                <RouterLink to="/privacy" class="hover:text-slate-900 transition">Privacy</RouterLink>
                <RouterLink to="/terms" class="hover:text-slate-900 transition">Terms</RouterLink>
                <RouterLink to="/contact" class="hover:text-slate-900 transition">Contact</RouterLink>
            </div>
        </div>
    </footer>
</template>