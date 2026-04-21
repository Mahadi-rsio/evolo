import type { ArgumentsCamelCase, CommandModule, Argv } from "yargs";
import { getProjectLogs } from "../api/projectApi.js";
import { logger } from "../utils/logger.js";
import { handleError } from "../utils/errors.js";

interface LogsArgs {
    projectId: string;
}

export const logsCmd: CommandModule<object, LogsArgs> = {
    command: "logs <projectId>",
    describe: "Show deployment logs for a project",
    builder: (yargs: Argv<object>): Argv<LogsArgs> =>
        yargs.positional("projectId", {
            type: "string",
            describe: "The project ID (from evolo.json or `evolo list`)",
            demandOption: true,
        }) as Argv<LogsArgs>,
    handler: async (argv: ArgumentsCamelCase<LogsArgs>) => {
        try {
            const spinner = logger.spinner("Fetching logs...").start();
            const logs = await getProjectLogs(argv.projectId);
            spinner.stop();

            if (logs.length === 0) {
                logger.info("No logs available for this project yet.");
                return;
            }

            for (const entry of logs) {
                const ts = new Date(entry.timestamp).toLocaleTimeString();
                if (entry.level === "error") {
                    logger.error(`[${ts}] ${entry.message}`);
                } else if (entry.level === "warn") {
                    logger.warn(`[${ts}] ${entry.message}`);
                } else {
                    logger.info(`[${ts}] ${entry.message}`);
                }
            }
        } catch (err) {
            handleError(err);
        }
    },
};
