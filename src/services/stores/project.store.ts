import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { projectService } from "@/services/project.service";
import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/project";
import api from "../api";


export const useProjectStore = defineStore("projects", () => {


    const projects = ref<Project[]>([]);



    async function fetchProjects(workspaceId: number) {

        const { data } =
            await projectService.getByWorkspace(workspaceId);


        projects.value = data;

    }

    const currentProject = ref<Project | null>(null);


    async function fetchProject(
        workspaceId: number,
        projectId: number
    ) {

        const { data } = await api.get(
            `/workspaces/${workspaceId}/projects/${projectId}`
        );


        currentProject.value = data;


        return data;
    }

    async function createProject(projectData: {
        workspaceId: number;
        name: string;
        description: string | null;
        status: ProjectStatus;
        startDate: string | null;
        endDate: string | null;
    }) {


        const { data } =
            await projectService.create(
                projectData
            );


        projects.value.push(data);


        return data;

    }


    const activeProjects = computed(() => {

        return projects.value.filter(
            project =>
                project.status === ProjectStatus.ACTIVE
        );

    });



    const completedProjects = computed(() => {

        return projects.value.filter(
            project =>
                project.status === ProjectStatus.COMPLETED
        );

    });



    const planningProjects = computed(() => {

        return projects.value.filter(
            project =>
                project.status === ProjectStatus.PLANNING
        );

    });

    async function updateProject(
        workspaceId: number,
        projectId: number,
        projectData: {
            name: string;
            description: string | null;
            status: ProjectStatus;
            startDate: string | null;
            endDate: string | null;
        }
    ) {

        const { data } =
            await projectService.update(
                workspaceId,
                projectId,
                projectData
            );


        // Update current project
        currentProject.value = data;


        // Update project in projects list
        const index =
            projects.value.findIndex(
                project =>
                    project.id === projectId
            );


        if (index !== -1) {

            projects.value[index] = data;

        }


        return data;
    }

    async function deleteProject(
    workspaceId: number,
    projectId: number
) {

    await projectService.delete(
        workspaceId,
        projectId
    );


    // Remove project from project list
    projects.value =
        projects.value.filter(
            project =>
                project.id !== projectId
        );


    // Clear current project if it was deleted
    if (
        currentProject.value?.id === projectId
    ) {

        currentProject.value = null;

    }

}


    function clear() {
        projects.value = [];
    }



    return {

        projects,
        activeProjects,
        currentProject,
        completedProjects,
        planningProjects,
        fetchProject,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        clear,

    };


});