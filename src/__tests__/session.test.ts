import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

// Override the session file path to a temp file for tests
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "evolo-test-"));
const testSessionFile = path.join(tmpDir, "evolo.session.json");

// We must set env var before importing session (config reads it at module load)
process.env["HOME"] = tmpDir;

// Dynamically import so the patched HOME is used
const { saveToken, getToken, clearToken } = await import("../utils/session.js");

describe("session", () => {
    beforeEach(() => {
        // Ensure clean state before each test
        if (fs.existsSync(testSessionFile)) fs.unlinkSync(testSessionFile);
    });

    afterEach(() => {
        if (fs.existsSync(testSessionFile)) fs.unlinkSync(testSessionFile);
    });

    it("getToken returns null when no session file exists", () => {
        expect(getToken()).toBeNull();
    });

    it("saveToken persists a token that getToken can retrieve", () => {
        saveToken("test-token-abc");
        expect(getToken()).toBe("test-token-abc");
    });

    it("clearToken removes the saved token", () => {
        saveToken("test-token-xyz");
        clearToken();
        expect(getToken()).toBeNull();
    });

    it("clearToken is a no-op when no session file exists", () => {
        expect(() => clearToken()).not.toThrow();
    });
});
