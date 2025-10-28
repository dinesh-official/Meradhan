import NextAuth from "next-auth";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google,
        Facebook,
        MicrosoftEntraID,
    ],

    callbacks: {
        async signIn(params) {
            console.log("Sign In Callback:", params);
            return true;
        },
    },

    pages: {
        signIn: "/login"
    },

});
