import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnLogin) {
        return true; // ログインページは誰でもアクセス可
      }
      
      if (isLoggedIn) {
        return true; // ログイン済みならアクセス可
      }
      
      return false; // 未ログインならログインページへリダイレクト
    },
  },
  providers: [], // ここは空にしておく（auth.tsで設定）
} satisfies NextAuthConfig;
