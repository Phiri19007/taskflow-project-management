<script setup lang="ts">
import { ref } from "vue";

import HelpHeader from "@/components/dashboard/views/sectionsHeaders/HelpHeader.vue";
import HelpCategories from "@/components/support/HelpCategories.vue";
import FAQSection from "@/components/support/FAQSection.vue";
import SendSupportEmailDialog from "@/components/dialogs/SendSupportEmailDialog.vue";

const supportDialogOpen = ref(false);

function handleSupportSent(request: {
    subject: string;
    category: string;
    message: string;
}) {
    console.log("Support request:", request);
}
</script>

<template>
    <main class="
            min-h-full
            flex-1
            overflow-y-auto
            bg-[#f4f7fa]
        ">
        <div class="
                mx-auto
                w-full
                max-w-375
                px-4
                py-4
                sm:px-5
                lg:px-6
            ">
            <div class="space-y-4">
                <HelpHeader @contact-support="supportDialogOpen = true" />

                <HelpCategories />

                <FAQSection />
            </div>
       

        <SendSupportEmailDialog v-model:open="supportDialogOpen" @sent="handleSupportSent" />
         </div>
    </main>
</template>
