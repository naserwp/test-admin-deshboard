import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const email = credentials?.email?.trim().toLowerCase();
          const password = credentials?.password;

          if (!email || !password) return null;

          // DB থেকে ইউজার বের করুন
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) return null;
          if (!user.passwordHash) return null; // Google-only user হলে passwordHash নাও থাকতে পারে

          // bcrypt দিয়ে password মিলান
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          // NextAuth-কে minimum fields ফেরত দিন
          return {
            id: user.id,
            email: user.email,
            name: user.userId ?? user.email, // আপনার schema অনুযায়ী
            role: user.role,
          } as any;
        } catch (e) {
          console.error("Credentials authorize error:", e);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // প্রথমবার sign-in এ `user` আসবে
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};
