/**
 * Centralized configuration module.
 * All configurable values are read here; the rest of the codebase imports from this file.
 */

export const config = {
    /** Base URL for the Evolo API. Override with EVOLO_API_URL env var. */
    API_BASE_URL: process.env["EVOLO_API_URL"] ?? "http://localhost:3000",

    /** Base URL for the auth server. Override with EVOLO_AUTH_URL env var. */
    AUTH_BASE_URL: process.env["EVOLO_AUTH_URL"] ?? "https://cloudisy.vercel.app",

    /** OAuth client ID used in the device-flow auth. */
    CLIENT_ID: process.env["EVOLO_CLIENT_ID"] ?? "demo-cli",

    /** Absolute path to the local session file that stores the access token. */
    SESSION_FILE_PATH: `${process.env["HOME"] ?? process.env["USERPROFILE"] ?? "~"}/evolo.session.json`,

    /** Build output directories, checked in order during deployment. */
    BUILD_DIRS: ["dist", "build", ".next", "out"] as const,
} as const;
