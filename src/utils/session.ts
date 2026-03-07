import fs from "fs";
import path from "path";
import os from "os";
import { authClient } from "../auth/deviceAuth.js";

const sessionFile = path.join(os.homedir(), "evolo.session.json");

export function saveToken(token: string) {
    fs.writeFileSync(sessionFile, JSON.stringify({
        access_token: token
    }));
}

export function getToken() {
    if (!fs.existsSync(sessionFile)) return null;

    const data = fs.readFileSync(sessionFile, "utf8");
    const session = JSON.parse(data);
    return session.access_token
}

export function clearToken() {
    if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
    }
}

export async function checkStatus() {
    const { data, error } = await authClient.getSession({
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    })

    if (error) {
        console.log("You are not logged in")
        process.exit(process.exitCode)
    }

    console.log("Deploy started for " + data?.user.id + ": " + data?.user.name);


    return {
        valid: true,
        uid: data?.user.id
    }
}
