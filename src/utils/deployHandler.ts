import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";
import pLimit from "p-limit";

const API = "http://localhost:3000/api/cloud";

function hashFile(filePath: string) {

    const file = fs.readFileSync(filePath);

    return crypto
        .createHash("sha256")
        .update(file)
        .digest("hex");
}

/*
Scan folder recursively
*/
function scanFolder(dir: string, base = "") {

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    let files: any[] = [];

    for (const entry of entries) {

        const fullPath = path.join(dir, entry.name);
        const relPath = base ? `${base}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            files = files.concat(scanFolder(fullPath, relPath));
        }

        if (entry.isFile()) {

            const hash = hashFile(fullPath);

            files.push({
                path: relPath,
                hash,
                fullPath
            });
        }
    }

    return files;
}

/*
Upload single file
*/
async function uploadFile(file: any) {

    const form = new FormData();

    form.append("file", fs.createReadStream(file.fullPath));
    form.append("hash", file.hash);

    await axios.post(`${API}/upload`, form, {
        headers: form.getHeaders()
    });

    console.log("Uploaded:", file.path);
}

/*
Main deploy
*/
export async function deploy(projectPath: string) {

    const buildDirs = ["dist", "build", ".next"];

    const buildPath = buildDirs
        .map(d => path.join(projectPath, d))
        .find(p => fs.existsSync(p));

    if (!buildPath) {
        console.error("No build folder found");
        return;
    }

    console.log("Scanning files...");

    const files = scanFolder(buildPath);

    console.log("Total files:", files.length);

    /*
    Ask server which hashes are missing
    */

    const res = await axios.post(`${API}/check`, {
        files: files.map(f => ({
            path: f.path,
            hash: f.hash
        }))
    });

    const missingHashes = res.data.missing;

    console.log("Missing files:", missingHashes.length);

    const filesToUpload = files.filter(f =>
        missingHashes.includes(f.hash)
    );

    /*
    Parallel upload
    */

    const limit = pLimit(10);

    await Promise.all(
        filesToUpload.map(file =>
            limit(() => uploadFile(file))
        )
    );

    /*
    Create manifest
    */

    const manifest: Record<string, string> = {};

    for (const f of files) {
        manifest[f.path] = f.hash;
    }

    const deployRes = await axios.post(`${API}/create`, {
        manifest
    });

    console.log("Deploy ID:", deployRes.data.deployId);

    console.log("Deployment finished 🚀");
}


