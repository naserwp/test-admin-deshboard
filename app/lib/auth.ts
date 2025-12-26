import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { rateLimit } from "./rateLimit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.userId || !credentials.password) {
          return null;
        }
        const ip =
          req?.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
          req?.headers?.["x-real-ip"]?.toString() ||
          "unknown";
        const limit = rateLimit(`login:${ip}`, 5, 60_000);
        if (!limit.allowed) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId }
        });
        if (!user) {
          return null;
        }
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          return null;
        }
        return {
          id: user.id,
          userId: user.userId,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.userId = (user as { userId: string }).userId;
        token.sub = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.userId = (token.userId as string) ?? "";
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  }
};
