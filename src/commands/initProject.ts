import fs from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import prompts from "prompts";
import { detectFramework } from "../utils/frameworkDetector.js";
import { logger } from "../utils/logger.js";
import { handleError, ConfigError } from "../utils/errors.js";

async function initProject() {
    const cwd = process.cwd();

    const files = fs.readdirSync(cwd);

    if (files.length === 0) {
        logger.warn("Directory is empty. Create a new project using: evolo new");
        return;
    }

    // detectFramework is async – must be awaited
    const detected = await detectFramework(cwd);
    const frameworks = Object.values(detected).flat();

    if (frameworks.length === 0) {
        throw new ConfigError("No supported framework detected in this project.");
    }

    const framework = frameworks[0];

    const response = await prompts({
        type: "text",
        name: "projectName",
        message: "Enter your project name",
        validate: (v: string) =>
            v.trim().length === 0 ? "Project name cannot be empty" : true,
    });

    if (!response.projectName) {
        logger.warn("Initialization cancelled.");
        return;
    }

    const evoloConfig = {
        project_name: response.projectName as string,
        framework,
    };

    const configPath = path.join(cwd, "evolo.json");
    fs.writeFileSync(configPath, JSON.stringify(evoloConfig, null, 2));

    logger.success("Project initialized successfully");
    logger.success(".gitignore file updated");
    logger.verbose(`Config created at ${configPath}`);

    //const gitIgnorePath = path.join(cwd, ".gitignore");
    // Ensure the entry appears on its own line regardless of existing content
    // const existingContent = fs.existsSync(gitIgnorePath)
    //     ? fs.readFileSync(gitIgnorePath, "utf-8")
    //     : "";
    // const prefix = existingContent.length > 0 && !existingContent.endsWith("\n") ? "\n" : "";
    // fs.appendFileSync(gitIgnorePath, `${prefix}evolo.json\n`);
}

export const initCmd: CommandModule = {
    command: "init",
    describe: "Initialize a project for deployment",
    handler: async () => {
        try {
            await initProject();
        } catch (err) {
            handleError(err);
        }
    },
};
