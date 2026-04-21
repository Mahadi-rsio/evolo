import fs from "fs";
import path from "path";
import type { ArgumentsCamelCase, CommandModule } from "yargs";
import { listEnvVars, setEnvVar, deleteEnvVar } from "../api/projectApi.js";
import { logger } from "../utils/logger.js";
import { handleError, ConfigError } from "../utils/errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveProjectId(flag: string | undefined): string {
    if (flag) return flag;

    const cfgPath = path.join(process.cwd(), "evolo.json");
    if (fs.existsSync(cfgPath)) {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8")) as { projectId?: string };
        if (cfg.projectId) return cfg.projectId;
    }

    throw new ConfigError(
        "Project ID not found. Pass --project <id> or run `evolo init` first.",
    );
}

// ---------------------------------------------------------------------------
// Sub-commands
// ---------------------------------------------------------------------------

const envSetCmd: CommandModule = {
    command: "set <key> <value>",
    describe: "Set an environment variable for a project",
    builder: (yargs) =>
        yargs
            .positional("key", { type: "string", demandOption: true })
            .positional("value", { type: "string", demandOption: true })
            .option("project", { type: "string", alias: "p", describe: "Project ID" }),
    handler: async (argv: ArgumentsCamelCase) => {
        try {
            const projectId = resolveProjectId(argv["project"] as string | undefined);
            await setEnvVar(projectId, argv["key"] as string, argv["value"] as string);
            logger.success(`Environment variable "${argv["key"]}" set.`);
        } catch (err) {
            handleError(err);
        }
    },
};

const envGetCmd: CommandModule = {
    command: "get [key]",
    describe: "List all env vars (or a specific one) for a project",
    builder: (yargs) =>
        yargs
            .positional("key", { type: "string" })
            .option("project", { type: "string", alias: "p", describe: "Project ID" }),
    handler: async (argv: ArgumentsCamelCase) => {
        try {
            const projectId = resolveProjectId(argv["project"] as string | undefined);
            const vars = await listEnvVars(projectId);

            const filterKey = argv["key"] as string | undefined;
            const filtered = filterKey ? vars.filter((v) => v.key === filterKey) : vars;

            if (filtered.length === 0) {
                logger.info("No environment variables found.");
                return;
            }

            for (const v of filtered) {
                logger.info(`  ${v.key}=${v.value}`);
            }
        } catch (err) {
            handleError(err);
        }
    },
};

const envDeleteCmd: CommandModule = {
    command: "delete <key>",
    describe: "Delete an environment variable from a project",
    builder: (yargs) =>
        yargs
            .positional("key", { type: "string", demandOption: true })
            .option("project", { type: "string", alias: "p", describe: "Project ID" }),
    handler: async (argv: ArgumentsCamelCase) => {
        try {
            const projectId = resolveProjectId(argv["project"] as string | undefined);
            await deleteEnvVar(projectId, argv["key"] as string);
            logger.success(`Environment variable "${argv["key"]}" deleted.`);
        } catch (err) {
            handleError(err);
        }
    },
};

// ---------------------------------------------------------------------------
// Parent command
// ---------------------------------------------------------------------------

export const envCmd: CommandModule = {
    command: "env <subcommand>",
    describe: "Manage environment variables for a deployment",
    builder: (yargs) =>
        yargs
            .command(envSetCmd)
            .command(envGetCmd)
            .command(envDeleteCmd)
            .demandCommand(1, "Please specify a subcommand: set, get, or delete"),
    handler: () => {
        // handled by sub-commands
    },
};
