import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google, Facebook, MicrosoftEntraID, Credentials({
        credentials: {
            username: { label: "Username" },
            password: { label: "Password", type: "password" },
        },
        async authorize({ password, username }) {
            return {
                id: "1",
                name: "John Doe",
                email: "K0lZM@example.com",
            };
        },
    }),],
    callbacks: {

        signIn(params) {

            console.log(params);

            return true
        },

        async session({ session, user }) {
            // attach database fields to session
            console.log(session, user);

            return session;
        },
    },
})