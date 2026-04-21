import fs from "fs";
import FormData from "form-data";
import { apiClient } from "./client.js";

export interface UploadResponse {
    jobId: string;
}

export interface JobStatus {
    state: string;
    failedReason?: string;
    result?: unknown;
}

/**
 * Upload a zipped build bundle to the deployment API.
 */
export async function uploadBundle(
    zipPath: string,
    projectId: string,
): Promise<UploadResponse> {
    const { size } = fs.statSync(zipPath);
    const form = new FormData();
    form.append("file", fs.createReadStream(zipPath), {
        filename: "bundle.zip",
        contentType: "application/zip",
        knownLength: size,
    });
    form.append("projectId", projectId);

    const response = await apiClient.post<UploadResponse>("/upload/hello", form, {
        headers: form.getHeaders(),
    });

    return response.data;
}

/**
 * Poll the status of a deployment job by ID.
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await apiClient.get<JobStatus>(`/upload/status/${jobId}`);
    return response.data;
}
