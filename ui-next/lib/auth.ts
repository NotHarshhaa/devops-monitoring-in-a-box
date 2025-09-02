import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma-server"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

// Check if database is available
let dbAvailable = false

const checkDatabaseAvailability = async () => {
  try {
    await prisma.$connect()
    dbAvailable = true
  } catch (error) {
    console.warn("Database not available, using JWT-only mode:", error)
    dbAvailable = false
  }
}

// Initialize database check
checkDatabaseAvailability()

export const authOptions: NextAuthOptions = {
  adapter: undefined, // We'll handle this dynamically
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

        // Check database availability dynamically
        if (!dbAvailable) {
          // Try to reconnect
          await checkDatabaseAvailability()
        }

        // Demo credentials for when database is not available
        if (!dbAvailable) {
          if (credentials.email === "demo@example.com" && credentials.password === "demo123") {
            return {
              id: "demo-user",
              email: "demo@example.com",
              name: "Demo User",
              image: null,
              role: UserRole.ADMIN,
            }
          }
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          // For demo purposes, we'll use a simple password check
          // In production, you should hash passwords properly
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "")

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Database error during authentication:", error)
          return null
        }
      }
    }),
    
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // GitHub OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
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
    },
    async signIn({ user, account, profile }) {
      // Check database availability dynamically
      if (!dbAvailable) {
        await checkDatabaseAvailability()
      }

      if (!dbAvailable) {
        // Allow OAuth sign-ins even without database
        return true
      }

      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if user exists, if not create them
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: UserRole.VIEWER, // Default role for OAuth users
              }
            })
          }
        } catch (error) {
          console.error("Database error during OAuth sign-in:", error)
          // Still allow sign-in even if database operations fail
        }
      }
      return true
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

// Helper function to create a demo user
export async function createDemoUser() {
  if (!dbAvailable) {
    console.warn("Database not available, demo user creation skipped")
    return null
  }

  try {
    const hashedPassword = await bcrypt.hash("demo123", 12)
    
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
        name: "Demo User",
        password: hashedPassword,
        role: UserRole.ADMIN,
      }
    })

    return demoUser
  } catch (error) {
    console.error("Error creating demo user:", error)
    return null
  }
}
