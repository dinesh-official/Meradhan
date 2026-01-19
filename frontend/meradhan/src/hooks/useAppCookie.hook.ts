const useAppCookie = () => {
  const isBrowser = typeof window !== "undefined";

  const clearCookies = () => {
    if (!isBrowser) return;

    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("meradhan_tracking_session");
  };

  return {
    cookies: {
      userId: isBrowser ? localStorage.getItem("userId") : undefined,
      name: isBrowser ? localStorage.getItem("name") : undefined,
      email: isBrowser ? localStorage.getItem("email") : undefined,
      meradhan_tracking_session: isBrowser
        ? localStorage.getItem("meradhan_tracking_session")
        : undefined,
    },
    setCookie: (name: string, value: string) => {
      if (!isBrowser) return;
      localStorage.setItem(name, value);
    },
    removeCookie: (name: string) => {
      if (!isBrowser) return;
      localStorage.removeItem(name);
    },
    clearCookies,
  };
};

export default useAppCookie;
