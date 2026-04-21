import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { detectFramework } from "../utils/frameworkDetector.js";

let tmpDir: string;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "evolo-fw-test-"));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writePkg(deps: Record<string, string>, devDeps: Record<string, string> = {}) {
    fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ dependencies: deps, devDependencies: devDeps }),
    );
}

describe("detectFramework", () => {
    it("detects Next.js as Fullstack", async () => {
        writePkg({ next: "14.0.0", react: "18.0.0" });
        const result = await detectFramework(tmpDir);
        expect(result.Fullstack).toContain("Next.js");
    });

    it("detects React as Frontend", async () => {
        writePkg({ react: "18.0.0" });
        const result = await detectFramework(tmpDir);
        expect(result.Frontend).toContain("React");
    });

    it("detects Express as Backend", async () => {
        writePkg({ express: "4.18.0" });
        const result = await detectFramework(tmpDir);
        expect(result.Backend).toContain("Express");
    });

    it("detects Vue as Frontend", async () => {
        writePkg({ vue: "3.0.0" });
        const result = await detectFramework(tmpDir);
        expect(result.Frontend).toContain("Vue");
    });

    it("detects Python project via requirements.txt", async () => {
        fs.writeFileSync(path.join(tmpDir, "requirements.txt"), "flask==2.0.0\n");
        const result = await detectFramework(tmpDir);
        expect(result.Other).toContain("Python Project");
    });

    it("returns empty categories when no framework found", async () => {
        writePkg({});
        const result = await detectFramework(tmpDir);
        expect(result.Frontend).toHaveLength(0);
        expect(result.Backend).toHaveLength(0);
        expect(result.Fullstack).toHaveLength(0);
    });

    it("handles missing package.json gracefully", async () => {
        // No package.json created – should not throw
        const result = await detectFramework(tmpDir);
        expect(result).toBeDefined();
    });
});
