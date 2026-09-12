<script setup lang="ts">

import ActiveProjectView from "@/components/dashboard/views/projectViews/ActiveProjectView.vue";
import ProjectDoneView from "@/components/dashboard/views/projectViews/ProjectDoneView.vue";
import ProjectOnHoldView from "@/components/dashboard/views/projectViews/ProjectOnHoldView.vue";


defineProps<{
    project: string | null;
}>();

</script>


<template>

    <ActiveProjectView 
        v-if="project === 'Active Project'" 
    />


    <ProjectDoneView 
        v-else-if="project === 'Project Done'" 
    />


    <ProjectOnHoldView 
        v-else-if="project === 'Project On Hold'" 
    />

</template>