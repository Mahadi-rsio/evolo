import fs from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { checkStatus } from "../utils/session.js";
import { detectFramework } from "../utils/frameworkDetector.js";
import { runBuild } from "../utils/buildHandler.js";
import { deploy } from "../utils/deployHandler.js";
import { handleError } from "../utils/errors.js";

export const deployCmd: CommandModule = {
    command: "deploy",
    describe: "Build and deploy the project to the cloud",
    handler: async () => {
        try {
            await checkStatus();
            await detectFramework("./");
            await runBuild("./");

            // Read project ID from evolo.json if available
            let project_name: string | undefined;
            const cfgPath = path.join(process.cwd(), "evolo.json");
            if (fs.existsSync(cfgPath)) {
                const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8")) as { project_name?: string };
                project_name = cfg.project_name;
            }

            await deploy("./", project_name);
        } catch (err) {
            handleError(err);
        }
    },
};
