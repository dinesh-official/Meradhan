const useAppCookie = () => {
  const clearCookies = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("meradhan_tracking_session");
  };
  return {
    cookies: {
      token: localStorage.getItem("token"),
      userId: localStorage.getItem("userId") as number | string | undefined,
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
      meradhan_tracking_session: localStorage.getItem(
        "meradhan_tracking_session",
      ),
    },
    setCookie: (name: string, value: string) => {
      localStorage.setItem(name, value);
    },
    removeCookie: (name: string) => {
      localStorage.removeItem(name);
    },
    clearCookies,
  };
};

export default useAppCookie;
