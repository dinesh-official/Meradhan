import { ISessionResponse } from "@root/apiGateway";
import { create } from "zustand";

export const userSessionStore = create<{
    session: ISessionResponse['responseData'] | null;
    setSession: (session: ISessionResponse['responseData'] | null) => void;
}>((set) => ({
    session: null,
    setSession: (session) => set({ session }),
}));