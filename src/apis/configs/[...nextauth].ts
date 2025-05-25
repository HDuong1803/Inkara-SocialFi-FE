import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    scope: 'openid email profile',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
    },
};

export default NextAuth(authOptions);