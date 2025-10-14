import { UserSessionDataResponse } from "@root/apiGateway";
import { create } from "zustand";

interface UseCurrentUserDataProp {
  user?: UserSessionDataResponse["responseData"];
  setUserData: (user: UserSessionDataResponse["responseData"]) => void;
}

export const useCurrentUserData = create<UseCurrentUserDataProp>()((set) => ({
  user: undefined,
  setUserData(user) {
    set(() => ({ user }));
  },
}));
