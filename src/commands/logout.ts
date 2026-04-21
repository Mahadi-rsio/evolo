import type { CommandModule } from "yargs";
import { clearToken } from "../utils/session.js";
import { logger } from "../utils/logger.js";

export const logoutCmd: CommandModule = {
    command: "logout",
    describe: "Log out and clear saved session",
    handler: () => {
        clearToken();
        logger.success("Logged out successfully. Run `evolo login` to authenticate again.");
    },
};
