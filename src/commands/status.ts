import ora from "ora";
import { authClient } from "../auth/deviceAuth.js";
import { getToken } from "../utils/session.js";



export async function status() {
    const spinner = ora().start()
    const { data, error } = await authClient.getSession({
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    })

    const jwtToken = await authClient.token({
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    })


    if (error && jwtToken.error) {
        console.log("Something went wrong " + error.message);
        return
    }
    spinner.stop()
    console.log("You are logged in as " + data?.user.name + "\n your token is " + jwtToken.data?.token);

}
