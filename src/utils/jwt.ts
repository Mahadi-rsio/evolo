import { authClient } from '../auth/deviceAuth.js'
import { getToken } from './../utils/session.js'
import { logger } from './logger.js'

export async function jwtToken() {
    const { data } = await authClient.token({
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    })

    if (!data) {
        logger.error("You are not logged in")
    }

    return data?.token
}
