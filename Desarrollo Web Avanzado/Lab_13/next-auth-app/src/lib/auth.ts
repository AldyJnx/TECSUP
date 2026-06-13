import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Bloqueo de inicio de sesion: tras MAX_ATTEMPTS fallidos se bloquea LOCK_MINUTES.
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Ingresa correo y contrasena");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Por seguridad no revelamos si el correo existe o no.
        if (!user || !user.password) {
          throw new Error("Credenciales invalidas");
        }

        // Cuenta bloqueada temporalmente
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error(
            "Cuenta bloqueada por demasiados intentos. Intenta mas tarde."
          );
        }

        const valid = await bcrypt.compare(credentials.password, user.password);

        if (!valid) {
          const attempts = user.failedAttempts + 1;
          const locked = attempts >= MAX_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: locked ? 0 : attempts,
              lockedUntil: locked
                ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
                : null,
            },
          });
          if (locked) {
            throw new Error(
              `Demasiados intentos. Cuenta bloqueada por ${LOCK_MINUTES} minutos.`
            );
          }
          throw new Error(
            `Credenciales invalidas. Intentos restantes: ${MAX_ATTEMPTS - attempts}`
          );
        }

        // Login correcto: reiniciamos el contador.
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signIn",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
