import { useCookies } from "react-cookie";

const useAppCookie = () => {
  const [cookies, setCookie, removeCookie] = useCookies([
    "token",
    "userId",
    "name",
    "email",
    "meradhan_tracking_session",
  ]);
  const clearCookies = () => {
    removeCookie("token");
    removeCookie("userId");
    removeCookie("name");
    removeCookie("email");
    removeCookie("meradhan_tracking_session");
  };
  return { cookies, setCookie, removeCookie, clearCookies };
};

export default useAppCookie;
