
const AUTH_TOKEN = `eyJhbGciOiJFZERTQSIsImtpZCI6IjU2OGZlN2I2LTg4NmItNDlmNS05YmYxLWEyZTgwNmM2MWExNyJ9.eyJpYXQiOjE3NzYzOTU5NTYsIm5hbWUiOiJSc2lvIEV4IiwiZW1haWwiOiJyc2lvZXhAZ21haWwuY29tIiwiZW1haWxWZXJpZmllZCI6dHJ1ZSwiaW1hZ2UiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJdWJpRDhLZ3hGN2tDeWRYMDVvMWZ2eWFxSXpkY183Vi1ubEM4b2tIaW9IbkthM1E9czk2LWMiLCJjcmVhdGVkQXQiOiIyMDI2LTA0LTE2VDIyOjQ0OjA2Ljk0MFoiLCJ1cGRhdGVkQXQiOiIyMDI2LTA0LTE2VDIyOjQ0OjA2Ljk0MFoiLCJpZCI6Ilk2RDJuZUZHRkpxbTdVenJpakVNa1RZclBZbXRwdW5iIiwic3ViIjoiWTZEMm5lRkdGSnFtN1V6cmlqRU1rVFlyUFltdHB1bmIiLCJleHAiOjE3NzcwMDA3NTYsImlzcyI6Imh0dHBzOi8vY2xvdWRpc3kudmVyY2VsLmFwcCIsImF1ZCI6Imh0dHBzOi8vY2xvdWRpc3kudmVyY2VsLmFwcCJ9.7izpUl0UC4lRa8hsQQI0I1GRkcGC-gD-aTlvzHQ41F2-YOu88mBp_O8EnEnXNdYfqPbD_rbQx3MUD-PEOaT4DA`

import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import FormData from "form-data";
import archiver from "archiver";
import ora from "ora";

const API_BASE = "http://localhost:3000";
const API_ENDPOINT = `${API_BASE}/upload/hello`;

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
    const statusUrl = `${API_BASE}/upload/status/${jobId}`;
    const maxWait = 120_000;
    const interval = 2_000;
    const start = Date.now();

    const spinner = ora("Processing upload...").start();

    while (Date.now() - start < maxWait) {
        const res = await axios.get(statusUrl, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        });

        const { state, failedReason } = res.data;

        if (state === "completed") {
            spinner.succeed("Live and deployed! 🎉");
            return;
        }

        if (state === "failed") {
            spinner.fail(`Processing failed: ${failedReason}`);
            return;
        }

        spinner.text = `Processing... (${state})`;
        await new Promise(r => setTimeout(r, interval));
    }

    spinner.fail("Timed out waiting for deployment to complete.");
}

export async function deploy(projectPath: string) {
    const buildDirs = ["dist", "build", ".next"];
    const buildPath = buildDirs
        .map(d => path.join(projectPath, d))
        .find(p => fs.existsSync(p));

    if (!buildPath) {
        console.error("❌ No build folder found (checked dist, build, .next)");
        return;
    }

    const tmpZip = path.join(os.tmpdir(), `bundle-${Date.now()}.zip`);

    // Step 1: Zip
    const zipSpinner = ora(`Zipping ${path.basename(buildPath)}...`).start();
    try {
        await zipDirectory(buildPath, tmpZip);
        const { size } = fs.statSync(tmpZip);
        zipSpinner.succeed(`Zipped successfully (${(size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
        zipSpinner.fail(`Zipping failed: ${err.message}`);
        fs.rmSync(tmpZip, { force: true });
        return;
    }

    // Step 2: Upload
    const uploadSpinner = ora("Uploading to cloud...").start();
    let jobId: string;
    try {
        const { size } = fs.statSync(tmpZip);
        const form = new FormData();
        form.append("file", fs.createReadStream(tmpZip), {
            filename: "bundle.zip",
            contentType: "application/zip",
            knownLength: size,
        });

        const response = await axios.post(API_ENDPOINT, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${AUTH_TOKEN}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60_000,
        });

        jobId = response.data.jobId;
        uploadSpinner.succeed(`Uploaded! Job ID: ${jobId}`);
    } catch (err: any) {
        const msg = err.response
            ? `${err.response.status}: ${JSON.stringify(err.response.data)}`
            : err.message;
        uploadSpinner.fail(`Upload failed: ${msg}`);
        fs.rmSync(tmpZip, { force: true });
        return;
    } finally {
        fs.rmSync(tmpZip, { force: true });
    }

    // Step 3: Poll
    await pollJobStatus(jobId);
}
