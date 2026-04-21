import fs from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import prompts from "prompts";
import { detectFramework } from "../utils/frameworkDetector.js";
import { logger } from "../utils/logger.js";
import { handleError, ConfigError } from "../utils/errors.js";
import { apiClient } from "../api/client.js";
import { authClient } from "../auth/deviceAuth.js";
import { getToken } from "../utils/session.js";

interface CreateProjectResponse {
    id: string;
    tenant_name: string;
    plan: string;
    domain: string;
    project_name: string;
    request: number;
    request_limit: number;
    bandwidth_usage: number;
    bandwidth_limit: number;
    createdAt: string;
}

async function initProject() {
    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);
    if (files.length === 0) {
        logger.warn("Directory is empty. Create a new project using: evolo new");
        return;
    }

    // Ask user whether to link existing or create new
    const { mode } = await prompts({
        type: "select",
        name: "mode",
        message: "How would you like to set up this project?",
        choices: [
            { title: "Create a new project", value: "new" },
            { title: "Link an existing project", value: "existing" },
        ],
    });

    if (!mode) {
        logger.warn("Initialization cancelled.");
        return;
    }

    if (mode === "existing") {
        logger.info("Linking to an existing project — coming soon.");
        return;
    }

    // --- New project flow ---
    const detected = await detectFramework(cwd);
    const frameworks = Object.values(detected).flat();
    if (frameworks.length === 0) {
        throw new ConfigError("No supported framework detected in this project.");
    }
    const framework = frameworks[0];

    const response = await prompts([
        {
            type: "text",
            name: "projectName",
            message: "Enter your project name",
            validate: (v: string) =>
                v.trim().length === 0 ? "Project name cannot be empty" : true,
        },
    ]);

    if (!response.projectName) {
        logger.warn("Initialization cancelled.");
        return;
    }

    const { data: sessionData, error: sessionError } = await authClient.getSession({
        fetchOptions: {
            headers: { Authorization: `Bearer ${getToken()}` },
        },
    });

    if (sessionError) {
        console.log("You are not logged in")
    }


    // Create project via API
    logger.info("Creating project...");
    const { data } = await apiClient.post<CreateProjectResponse>(
        "/api/pages/create",
        {
            tenant_name: sessionData?.user.name,
            project_name: response.projectName as string,
            plan: "free",
        },
    );

    const evoloConfig = {
        id: data.id,
        project_name: data.project_name,
        domain: data.domain,
        framework,
        created_at: data.createdAt,
    };

    const configPath = path.join(cwd, "evolo.json");
    fs.writeFileSync(configPath, JSON.stringify(evoloConfig, null, 2));

    const gitIgnorePath = path.join(cwd, ".gitignore");
    const existingContent = fs.existsSync(gitIgnorePath)
        ? fs.readFileSync(gitIgnorePath, "utf-8")
        : "";
    const prefix =
        existingContent.length > 0 && !existingContent.endsWith("\n") ? "\n" : "";
    fs.appendFileSync(gitIgnorePath, `${prefix}\nevolo.json\n`);

    logger.success(`Project "${data.project_name}" created successfully`);
    logger.success(`Domain: ${data.domain}`);
    logger.success(".gitignore file updated");
    logger.verbose(`Config created at ${configPath}`);
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
