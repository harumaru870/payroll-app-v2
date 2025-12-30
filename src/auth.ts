import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true, // Vercelなどのホストプロキシ環境で必要
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // 環境変数の値と照合（簡易実装）
          if (
            email === process.env.ADMIN_EMAIL && 
            password === process.env.ADMIN_PASSWORD
          ) {
            return {
              id: '1',
              name: 'Admin User',
              email: email,
            };
          }
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
