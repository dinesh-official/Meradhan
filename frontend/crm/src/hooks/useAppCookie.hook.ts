import { useCookies } from "react-cookie";

const useAppCookie = () => {
  const [cookies, setCookie, removeCookie] = useCookies([
    "token",
    "userId",
    "role",
    "SESSION",
  ]);
  return { cookies, setCookie, removeCookie };
};

export default useAppCookie;
