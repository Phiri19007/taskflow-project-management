import api from "./api";

export const projectService = {

    getByWorkspace(workspaceId: number) {
        return api.get(
            `/workspaces/${workspaceId}/projects`
        );
    },


    create(data: {
        workspaceId: number;
        name: string;
        description: string | null;
        status: string;
        startDate: string | null;
        endDate: string | null;
    }) {

        return api.post(
            "/projects",
            data
        );
    },


    update(
        workspaceId: number,
        projectId: number,
        data: {
            name: string;
            description: string | null;
            status: string;
            startDate: string | null;
            endDate: string | null;
        }
    ) {

        return api.patch(
            `/workspaces/${workspaceId}/projects/${projectId}`,
            data
        );
    },

    delete(
        workspaceId: number,
        projectId: number
    ) {

        return api.delete(
            `/workspaces/${workspaceId}/projects/${projectId}`
        );
    },

};