import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Auth0({
      clientId: process.env.AUTH_AUTH0_ID,
      clientSecret: process.env.AUTH_AUTH0_SECRET,
      issuer: process.env.AUTH_AUTH0_ISSUER,
    }),
  ],
});