import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, we'll use hardcoded credentials
        // In production, you should query the database
        const demoUsers = [
          {
            id: "1",
            email: "demo@example.com",
            password: "demo123",
            name: "Demo Admin",
            role: UserRole.ADMIN,
          },
          {
            id: "2", 
            email: "editor@example.com",
            password: "editor123",
            name: "Demo Editor",
            role: UserRole.EDITOR,
          },
          {
            id: "3",
            email: "viewer@example.com", 
            password: "viewer123",
            name: "Demo Viewer",
            role: UserRole.VIEWER,
          }
        ]

        const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password)
        
        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
