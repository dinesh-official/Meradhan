import { ReactCookieProps } from "react-cookie";

export const COOKIE_EXPIRY_TIME = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000
);

export const COOKIE_OPTIONS: ReactCookieProps["defaultSetOptions"] = {
  expires: COOKIE_EXPIRY_TIME,
};
