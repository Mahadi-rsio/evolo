#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";

// Import your command logic
// Note: Ensure these files also use the shared 'onCancel' if they call 'prompts'
import { loginCommand } from "./commands/login.js";
import { runBuild } from "./utils/buildHandler.js";
import { detectFramework } from "./utils/frameworkDetector.js";
import { initProject } from "./commands/initProject.js";
import { status } from "./commands/status.js";
import { deploy } from "./utils/deployHandler.js";
import { checkStatus } from "./utils/session.js";

/**
 * Global cancel handler for 'prompts'
 * This handles both ESC and Ctrl+C during an active prompt.
 */
/**
 * Standard Node process listener
 * This handles Ctrl+C when the CLI is idle or running non-prompt logic.
 */
process.on("SIGINT", () => {
    console.log(chalk.red("\n[Process Terminated]"));
    process.exit(0);
});

// Initialize Yargs
yargs(hideBin(process.argv))
    .scriptName("evolo")
    .usage("$0 <command> [options]")

    .command(
        "login",
        "Login to your account",
        () => { },
        async () => {
            // Pass { onCancel } as the second argument to any prompts call
            await loginCommand();
        }
    )

    .command(
        "init",
        "Initialize project",
        () => { },
        async () => {
            await initProject()
        }
    )

    .command(
        "status",
        "check account status",
        () => { },
        async () => {
            await status()
        }
    )

    .command(
        "deploy",
        "Deploy to cloud",
        () => { },
        async () => {
            await checkStatus()
            await detectFramework('./')
            await runBuild('./')
            await deploy('./')
        }
    )
    .demandCommand(1, chalk.red("Please specify a command."))
    .help()
    .alias("h", "help")
    .parse();

