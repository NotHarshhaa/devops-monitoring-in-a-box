import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from "@prisma/client"

// Auto-detect environment and set appropriate defaults
const getNextAuthConfig = () => {
  const isVercel = process.env.VERCEL === "1"
  const isProduction = process.env.NODE_ENV === "production"
  
  return {
    secret: process.env.NEXTAUTH_SECRET || "devops-monitoring-demo-secret-key-2024",
    url: isVercel 
      ? `https://${process.env.VERCEL_URL || "devops-monitoring-in-a-box.vercel.app"}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000",
    debug: !isProduction
  }
}

const config = getNextAuthConfig()

export const authOptions: NextAuthOptions = {
  secret: config.secret,
  debug: config.debug,
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
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user && token.sub) {
        (session.user as any).id = token.sub as string
        (session.user as any).role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
}
