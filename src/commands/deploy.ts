import fs from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { checkStatus } from "../utils/session.js";
import { detectFramework } from "../utils/frameworkDetector.js";
import { runBuild } from "../utils/buildHandler.js";
import { deploy } from "../utils/deployHandler.js";
import { handleError, ConfigError } from "../utils/errors.js";

interface EvoloConfig {
    id?: string;
    project_name?: string;
}

function resolvePageId(cwd: string): string {
    const cfgPath = path.join(cwd, "evolo.json");
    if (!fs.existsSync(cfgPath)) {
        throw new ConfigError(
            "No evolo.json found. Run `evolo init` to create or link a project.",
        );
    }

    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8")) as EvoloConfig;
    const pageId = cfg.id ?? cfg.project_name;
    if (!pageId) {
        throw new ConfigError(
            "evolo.json is missing id and project_name. Run `evolo init` again.",
        );
    }
    return pageId;
}

export const deployCmd: CommandModule = {
    command: "deploy",
    describe:
        "Build and deploy to the cloud (uploads originals; server optimizes assets at commit)",
    handler: async () => {
        try {
            await checkStatus();
            await detectFramework("./");
            await runBuild("./");

            const pageId = resolvePageId(process.cwd());
            await deploy("./", pageId);
        } catch (err) {
            handleError(err);
        }
    },
};
