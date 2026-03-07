import fs from "fs";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import { randomUUID } from "crypto";
import { detectFramework } from "../utils/frameworkDetector.js";

export async function initProject() {
    const cwd = process.cwd();

    try {
        // check directory contents
        const files = fs.readdirSync(cwd);

        if (files.length === 0) {
            console.log(
                chalk.yellow(
                    "Directory is empty. Create a new project using:"
                )
            );
            console.log(chalk.cyan("  evolo new"));
            return;
        }

        // detect frameworks
        const detected = detectFramework(cwd);

        const frameworks = Object.values(detected).flat();

        if (frameworks.length === 0) {
            console.log(
                chalk.red("No supported framework detected in this project.")
            );
            return;
        }

        const framework = frameworks[0];

        // ask project name
        const response = await prompts({
            type: "text",
            name: "projectName",
            message: "Enter your project name",
            validate: (v: string) =>
                v.trim().length === 0 ? "Project name cannot be empty" : true,
        });

        if (!response.projectName) {
            console.log(chalk.red("Initialization cancelled"));
            return;
        }

        const evoloConfig = {
            projectName: response.projectName,
            projectId: randomUUID(),
            framework,
        };

        const configPath = path.join(cwd, "evolo.json");

        fs.writeFileSync(configPath, JSON.stringify(evoloConfig, null, 2));

        console.log(chalk.green("\n✔ evolo project initialized successfully \n✔.gitignore file updated"));
        console.log(chalk.gray(`Config created at ${configPath}`));

        const gitIgnorePath = path.join(cwd, ".gitignore")
        fs.appendFileSync(gitIgnorePath, "evolo.json")

    } catch (err) {
        console.error(chalk.red("Init failed"));
        console.error(err);
    }
}
