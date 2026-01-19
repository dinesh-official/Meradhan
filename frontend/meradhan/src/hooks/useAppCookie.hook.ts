const encode = (value: string): string => {
  return btoa(encodeURIComponent(value).split("").reverse().join(""));
};

const decode = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded).split("").reverse().join(""));
  } catch {
    return "";
  }
};

const useAppCookie = () => {
  const isBrowser = typeof window !== "undefined";

  const getItem = (key: string) => {
    if (!isBrowser) return undefined;
    const value = localStorage.getItem(key);
    return value ? decode(value) : undefined;
  };

  const setItem = (key: string, value: string) => {
    if (!isBrowser) return;
    localStorage.setItem(key, encode(value));
  };

  const removeItem = (key: string) => {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  };

  const clearCookies = () => {
    if (!isBrowser) return;

    removeItem("userId");
    removeItem("name");
    removeItem("email");
    removeItem("meradhan_tracking_session");
  };

  return {
    cookies: {
      userId: getItem("userId"),
      name: getItem("name"),
      email: getItem("email"),
      meradhan_tracking_session: getItem("meradhan_tracking_session"),
    },
    setCookie: setItem,
    removeCookie: removeItem,
    clearCookies,
  };
};

export default useAppCookie;
