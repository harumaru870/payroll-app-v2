import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import { authConfig } from './auth.config';

const secret = process.env.AUTH_SECRET;

if (!secret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is not defined in environment variables.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: secret, // Explicitly pass the secret
  trustHost: true,
  providers: [
    Auth0({
      clientId: process.env.AUTH_AUTH0_ID,
      clientSecret: process.env.AUTH_AUTH0_SECRET,
      issuer: process.env.AUTH_AUTH0_ISSUER,
    }),
  ],
});