import { describe, it, expect } from "vitest";
import { config } from "../config.js";

describe("config", () => {
    it("API_BASE_URL has a non-empty value", () => {
        expect(typeof config.API_BASE_URL).toBe("string");
        expect(config.API_BASE_URL.length).toBeGreaterThan(0);
    });

    it("API_BASE_URL matches EVOLO_API_URL env var when set", () => {
        // config is read at module load; verify it picks up the env var if present
        const expected = process.env["EVOLO_API_URL"] ?? "https://api.evolo.dev";
        expect(config.API_BASE_URL).toBe(expected);
    });

    it("AUTH_BASE_URL matches EVOLO_AUTH_URL env var when set", () => {
        const expected = process.env["EVOLO_AUTH_URL"] ?? "https://cloudisy.vercel.app";
        expect(config.AUTH_BASE_URL).toBe(expected);
    });

    it("CLIENT_ID matches EVOLO_CLIENT_ID env var when set", () => {
        const expected = process.env["EVOLO_CLIENT_ID"] ?? "demo-cli";
        expect(config.CLIENT_ID).toBe(expected);
    });

    it("default API_BASE_URL is the production URL when env var is absent", () => {
        if (!process.env["EVOLO_API_URL"]) {
            expect(config.API_BASE_URL).toBe("https://api.evolo.dev");
        }
    });

    it("default AUTH_BASE_URL is the production auth URL when env var is absent", () => {
        if (!process.env["EVOLO_AUTH_URL"]) {
            expect(config.AUTH_BASE_URL).toBe("https://cloudisy.vercel.app");
        }
    });

    it("BUILD_DIRS contains expected directories", () => {
        expect(config.BUILD_DIRS).toContain("dist");
        expect(config.BUILD_DIRS).toContain("build");
        expect(config.BUILD_DIRS).toContain(".next");
    });

    it("SESSION_FILE_PATH ends with evolo.session.json", () => {
        expect(config.SESSION_FILE_PATH).toMatch(/evolo\.session\.json$/);
    });
});
