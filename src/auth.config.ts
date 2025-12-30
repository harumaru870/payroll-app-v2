import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isOnLogin) return true; // ログインページは誰でもアクセス可
        if (isLoggedIn) return true;
        return false; // 未ログインならログインページへリダイレクト
      }
      return true;
    },
  },
  providers: [], // ここは空にしておく（auth.tsで設定）
} satisfies NextAuthConfig;
