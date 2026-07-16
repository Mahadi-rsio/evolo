import fs from "fs";
import path from "path";
import os from "os";
import archiver from "archiver";
import { config } from "../config.js";
import { logger } from "./logger.js";
import { NetworkError } from "./errors.js";
import { uploadBundle, getJobStatus } from "../api/deployApi.js";

function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        output.on("close", () => resolve());
        archive.on("error", (err) => reject(err));
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

async function pollJobStatus(jobId: string): Promise<void> {
    const maxWait = 120_000;
    const interval = 2_000;
    const start = Date.now();

    const spinner = logger.spinner("Processing upload...").start();

    while (Date.now() - start < maxWait) {
        const { state, failedReason } = await getJobStatus(jobId);

        if (state === "completed") {
            spinner.succeed("Live and deployed! 🎉");
            return;
        }

        if (state === "failed") {
            spinner.fail(`Processing failed: ${failedReason ?? "unknown reason"}`);
            return;
        }

        spinner.text = `Processing... (${state})`;
        await new Promise<void>((r) => setTimeout(r, interval));
    }

    spinner.fail("Timed out waiting for deployment to complete.");
}

export async function deploy(projectPath: string, project_name = "unknown") {
    const buildPath = config.BUILD_DIRS
        .map((d) => path.join(projectPath, d))
        .find((p) => fs.existsSync(p));

    if (!buildPath) {
        throw new NetworkError(
            `No build folder found (checked: ${config.BUILD_DIRS.join(", ")})`,
        );
    }

    const tmpZip = path.join(os.tmpdir(), `bundle-${Date.now()}.zip`);

    // Step 1: Zip
    const zipSpinner = logger.spinner(`Zipping ${path.basename(buildPath)}...`).start();
    try {
        await zipDirectory(buildPath, tmpZip);
        const { size } = fs.statSync(tmpZip);
        zipSpinner.succeed(`Zipped successfully (${(size / 1024).toFixed(1)} KB)`);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        zipSpinner.fail(`Zipping failed: ${msg}`);
        fs.rmSync(tmpZip, { force: true });
        throw err;
    }

    // Step 2: Upload
    const uploadSpinner = logger.spinner("Uploading to cloud...").start();
    let jobId: string;
    try {
        const result = await uploadBundle(tmpZip, project_name);
        jobId = result.jobId;
        uploadSpinner.succeed(`Uploaded! Job ID: ${jobId}`);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        uploadSpinner.fail(`Upload failed: ${msg}`);
        throw err;
    } finally {
        fs.rmSync(tmpZip, { force: true });
    }

    // Step 3: Poll
    await pollJobStatus(jobId);
}
