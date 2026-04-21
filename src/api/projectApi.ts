import { apiClient } from "./client.js";

export interface Project {
    id: string;
    name: string;
    framework: string;
    url?: string;
    createdAt: string;
}

export interface EnvVar {
    key: string;
    value: string;
}

export interface DeploymentLog {
    timestamp: string;
    message: string;
    level: "info" | "warn" | "error";
}

/**
 * List all projects belonging to the authenticated user.
 */
export async function listProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>("/projects");
    return response.data;
}

/**
 * Fetch deployment logs for a project.
 */
export async function getProjectLogs(projectId: string): Promise<DeploymentLog[]> {
    const response = await apiClient.get<DeploymentLog[]>(`/projects/${projectId}/logs`);
    return response.data;
}

/**
 * List env vars for a project.
 */
export async function listEnvVars(projectId: string): Promise<EnvVar[]> {
    const response = await apiClient.get<EnvVar[]>(`/projects/${projectId}/env`);
    return response.data;
}

/**
 * Set an env var for a project.
 */
export async function setEnvVar(projectId: string, key: string, value: string): Promise<void> {
    await apiClient.post(`/projects/${projectId}/env`, { key, value });
}

/**
 * Delete an env var from a project.
 */
export async function deleteEnvVar(projectId: string, key: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/env/${key}`);
}
