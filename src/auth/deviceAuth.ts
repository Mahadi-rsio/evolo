import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import open from "open";
import ora from "ora";
import chalk from "chalk";
import { saveToken } from "../utils/session.js";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [deviceAuthorizationClient()],
});

export async function deviceLogin() {
    const spinner = ora("Requesting device authorization").start();

    const { data, error } = await authClient.device.code({
        client_id: "demo-cli",
        scope: "openid profile email",
    });

    if (error || !data) {
        spinner.fail("Failed to start auth");
        throw new Error(error?.error_description);
    }

    spinner.stop();

    const {
        device_code,
        user_code,
        verification_uri,
        verification_uri_complete,
        interval = 5,
    } = data;

    console.log(chalk.cyan("\nDevice Authorization"));
    console.log(chalk.yellow(`Code: ${user_code}`));
    console.log(chalk.green(`Visit: ${verification_uri}\n`));

    await open(verification_uri_complete || verification_uri);

    return pollForToken(device_code, interval);
}

async function pollForToken(deviceCode: string, interval: number) {
    const spinner = ora("Waiting for authorization").start();

    let pollingInterval = interval;

    return new Promise<string>((resolve, reject) => {
        const poll = async () => {
            const { data, error } = await authClient.device.token({
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                device_code: deviceCode,
                client_id: "demo-cli",
            });



            if (data?.access_token) {
                spinner.succeed("Authorization successful");
                resolve(data.access_token);
                saveToken(data.access_token)
                return;
            }

            if (error) {
                switch (error.error) {
                    case "authorization_pending":
                        break;

                    case "slow_down":
                        pollingInterval += 5;
                        spinner.text = `Slowing down polling (${pollingInterval}s)`;
                        break;

                    case "access_denied":
                        spinner.fail("User denied access");
                        reject("Access denied");
                        return;

                    case "expired_token":
                        spinner.fail("Device code expired");
                        reject("Token expired");
                        return;

                    default:
                        spinner.fail(error.error_description);
                        reject(error.error_description);
                        return;
                }
            }

            setTimeout(poll, pollingInterval * 1000);
        };

        setTimeout(poll, pollingInterval * 1000);
    });
}
