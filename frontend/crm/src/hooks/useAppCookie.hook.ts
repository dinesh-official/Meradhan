import { useCookies } from "react-cookie";

const useAppCookie = () => {
     const [cookies, setCookie, removeCookie] = useCookies(['token','userId',"role"]);
     return { cookies, setCookie, removeCookie };
  }

export default useAppCookie;