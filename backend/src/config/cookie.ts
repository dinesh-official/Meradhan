import type { CookieOptions } from "express"

const COOKIE_EXPIRY_TIME = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

export const cookieOptions: CookieOptions = {
    expires: COOKIE_EXPIRY_TIME,
    path: '/',
    sameSite: 'strict',
    secure: false,
}