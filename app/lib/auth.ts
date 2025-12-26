import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { rateLimit } from "./rateLimit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      /**
       * NOTE:
       * আগে ছিল userId + password
       * এখন করা হলো identifier + password
       * যাতে userId অথবা email—দুটো দিয়েই login করা যায়।
       */
      credentials: {
        identifier: { label: "User ID or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        // NOTE: credentials validation
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!identifier || !password) return null;

        // NOTE: rate limit (আগের মতোই রাখা হলো)
        const ip =
          req?.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
          req?.headers?.["x-real-ip"]?.toString() ||
          "unknown";

        const limit = rateLimit(`login:${ip}`, 5, 60_000);
        if (!limit.allowed) return null;

        /**
         * NOTE:
         * আগে findUnique({ where: { userId } })
         * এখন findFirst + OR ব্যবহার করছি
         * যাতে identifier = userId অথবা email match করে।
         */
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ userId: identifier }, { email: identifier }],
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        /**
         * NOTE:
         * এখানে যা return করবেন, তা jwt() callback এর user হিসেবে যাবে।
         * তাই email/imageUrl/role এগুলো return করলে session এ পাঠানো সহজ হয়।
         */
        return {
          id: user.id,
          userId: user.userId,
          email: user.email ?? null,
          role: user.role,
          imageUrl: user.imageUrl ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    /**
     * NOTE:
     * jwt token এ আমরা custom fields রাখছি:
     * - role
     * - userId
     * - email
     * - imageUrl
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = (user as any).userId;
        token.email = (user as any).email ?? null;
        token.imageUrl = (user as any).imageUrl ?? null;

        // token.sub ব্যবহার করে session.user.id set করছেন—এটা ঠিক আছে
        token.sub = (user as any).id;
      }
      return token;
    },

    /**
     * NOTE:
     * session.user এ token থেকে fields বসাচ্ছি,
     * যেন UI (TopNav/Avatar/Admin guard) সহজে কাজ করে।
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.user.userId = (token.userId as string) ?? "";
        session.user.role = (token.role as string) ?? "USER";

        // Extra fields for profile/avatar
        (session.user as any).email = (token.email as string | null) ?? null;
        (session.user as any).imageUrl = (token.imageUrl as string | null) ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};
