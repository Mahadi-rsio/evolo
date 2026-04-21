import axios, { type AxiosInstance, type AxiosError } from "axios";
import { config } from "../config.js";
import { getToken } from "../utils/session.js";
import { NetworkError, AuthError } from "../utils/errors.js";

// ---------------------------------------------------------------------------
// Shared axios instance
// ---------------------------------------------------------------------------

export function createApiClient(): AxiosInstance {
    const instance = axios.create({
        baseURL: config.API_BASE_URL,
        timeout: 60_000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });

    // Inject auth token on every request
    instance.interceptors.request.use((reqConfig) => {
        const token = getToken();
        if (token) {
            reqConfig.headers = reqConfig.headers ?? {};
            reqConfig.headers["Authorization"] = `Bearer ${token}`;
        }
        return reqConfig;
    });

    // Translate HTTP errors into typed Evolo errors
    instance.interceptors.response.use(
        (res) => res,
        (err: AxiosError) => {
            if (err.response?.status === 401 || err.response?.status === 403) {
                return Promise.reject(
                    new AuthError("Session expired or invalid. Please run `evolo login`."),
                );
            }
            const message = err.response
                ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
                : err.message;
            return Promise.reject(new NetworkError(message));
        },
    );

    return instance;
}

/** Singleton API client – import this in api sub-modules. */
export const apiClient = createApiClient();
