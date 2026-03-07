import { deviceLogin } from "./../auth/deviceAuth.js";
import { saveToken } from "../utils/session.js";
import chalk from "chalk";

export async function loginCommand() {
    try {
        const token = await deviceLogin();

        saveToken(token);

        console.log(chalk.green("\nLogin successful!"));
    } catch (err) {
        console.error(chalk.red("Login failed"));
    }
}
