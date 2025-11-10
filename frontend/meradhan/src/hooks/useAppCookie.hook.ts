import { useCookies } from "react-cookie";

const useAppCookie = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'userId', "name", "email"]);
 const clearCookies = () => {
    removeCookie('token');
    removeCookie('userId');
    removeCookie('name');
    removeCookie('email');
  }
     return { cookies, setCookie, removeCookie,clearCookies };
  }

export default useAppCookie;