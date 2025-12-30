import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import { authConfig } from './auth.config';

// Temporary debug for production
if (process.env.NODE_ENV === 'production') {
  console.log('--- Auth Config Check ---');
  console.log('AUTH_SECRET status:', process.env.AUTH_SECRET ? 'Defined' : 'MISSING');
  console.log('AUTH_AUTH0_ID status:', process.env.AUTH_AUTH0_ID ? 'Defined' : 'MISSING');
  console.log('AUTH_AUTH0_ISSUER:', process.env.AUTH_AUTH0_ISSUER || 'MISSING');
  console.log('-------------------------');
}

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