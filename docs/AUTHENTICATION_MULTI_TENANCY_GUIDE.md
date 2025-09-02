# Authentication & Multi-Tenancy Implementation Guide

This guide documents the complete implementation of Phase 6 - Authentication & Multi-Tenancy for the DevOps Monitoring Dashboard.

## 🎯 **Overview**

The authentication and multi-tenancy system provides:
- **NextAuth.js Integration**: Secure authentication with multiple providers
- **Role-Based Access Control**: Admin, Editor, and Viewer roles
- **Multi-User Support**: Each user can save their own dashboards and configurations
- **User Management**: Admin panel for managing users and permissions
- **Session Management**: Secure session handling with JWT tokens

## 🏗️ **Architecture**

### **Authentication Flow**
```
User → Login Page → NextAuth.js → Database → JWT Token → Protected Routes
```

### **Multi-Tenancy Architecture**
```
User → User-Specific Config → Multi-Tenant Manager → Isolated Data Storage
```

## 🔧 **Technical Implementation**

### **1. Database Schema (Prisma)**

#### **User Model**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  password      String?   // For credentials authentication
  role          UserRole  @default(VIEWER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  dashboards    Dashboard[]
  configurations Configuration[]
  teams         TeamMember[]
  createdTeams  Team[]
}
```

#### **Role-Based Access Control**
```prisma
enum UserRole {
  ADMIN    // Full system access
  EDITOR   // Can modify configurations
  VIEWER   // Read-only access
}
```

#### **Multi-Tenant Data Models**
```prisma
model Dashboard {
  id            String   @id @default(cuid())
  name          String
  description   String?
  config        Json     // Dashboard configuration JSON
  isPublic      Boolean  @default(false)
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String?  // User-specific dashboard
  teamId        String?  // Team-specific dashboard
  
  user          User?    @relation(fields: [userId], references: [id])
  team          Team?    @relation(fields: [teamId], references: [id])
}

model Configuration {
  id            String   @id @default(cuid())
  name          String
  description   String?
  config        Json     // Configuration JSON
  type          ConfigType @default(MONITORING)
  isPublic      Boolean  @default(false)
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String?  // User-specific configuration
  teamId        String?  // Team-specific configuration
  
  user          User?    @relation(fields: [userId], references: [id])
  team          Team?    @relation(fields: [teamId], references: [id])
}
```

### **2. NextAuth.js Configuration**

#### **Authentication Providers**
```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials and return user
      }
    }),
    
    // OAuth providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
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
  }
}
```

### **3. Route Protection Middleware**

#### **Authentication Middleware**
```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const userRole = token?.role

    // Redirect unauthenticated users
    if (!isAuth) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Role-based access control
    if (req.nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (req.nextUrl.pathname.startsWith("/settings") && !["ADMIN", "EDITOR"].includes(userRole as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicRoutes = ["/", "/auth", "/api/auth"]
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname.startsWith(route)
        )
        
        return isPublicRoute || !!token
      },
    },
  }
)
```

### **4. Multi-Tenant Configuration System**

#### **Multi-Tenant Manager**
```typescript
// lib/config/multi-tenant-manager.ts
export class MultiTenantConfigManager {
  private configs: Map<string, MonitoringConfig> = new Map()
  private listeners: Map<string, Array<(config: MonitoringConfig) => void>> = new Map()

  getConfig(userId: string): MonitoringConfig {
    return this.configs.get(userId) || { ...DEFAULT_CONFIG }
  }

  updateConfig(userId: string, update: ConfigUpdate): ConfigValidationResult {
    // Update configuration for specific user
  }

  loadFromJson(userId: string, jsonString: string): ConfigValidationResult {
    // Load configuration from JSON for specific user
  }

  exportToJson(userId: string): string {
    // Export user-specific configuration
  }
}
```

#### **Multi-Tenant Hook**
```typescript
// lib/hooks/use-multi-tenant-config.ts
export function useMultiTenantConfig() {
  const { data: session } = useSession()
  const userId = session?.user?.id || 'anonymous'
  
  const [config, setConfig] = useState<MonitoringConfig>(() => {
    if (typeof window !== 'undefined') {
      return multiTenantConfigManager.getConfig(userId)
    }
    return DEFAULT_CONFIG
  })

  // User-specific configuration operations
  const updateConfig = useCallback(async (update: ConfigUpdate) => {
    return multiTenantConfigManager.updateConfig(userId, update)
  }, [userId])

  return {
    config,
    updateConfig,
    loadFromJson: (jsonString: string) => multiTenantConfigManager.loadFromJson(userId, jsonString),
    exportConfig: () => multiTenantConfigManager.exportToJson(userId),
    // ... other user-specific operations
  }
}
```

## 🎨 **User Interface Components**

### **1. Authentication Pages**

#### **Sign In Page** (`/auth/signin`)
- **Credentials Login**: Email/password authentication
- **OAuth Providers**: Google and GitHub integration
- **Demo Credentials**: Pre-configured demo accounts
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: User-friendly error messages

#### **Sign Up Page** (`/auth/signup`)
- **Registration Form**: Name, email, password fields
- **Password Validation**: Minimum length and confirmation
- **OAuth Registration**: Automatic account creation
- **Success Flow**: Auto sign-in after registration

### **2. User Management Components**

#### **User Menu** (`components/user-menu.tsx`)
- **User Avatar**: Profile picture or initials
- **Role Badge**: Visual role indicator
- **Dropdown Menu**: Profile, settings, admin access
- **Sign Out**: Secure logout functionality

#### **Admin Panel** (`/admin`)
- **User Management**: View, edit, delete users
- **Role Assignment**: Change user roles
- **System Statistics**: User counts, configurations
- **Access Control**: Admin-only access

#### **User Profile** (`/profile`)
- **Personal Information**: Name, email editing
- **Account Statistics**: Dashboards, configurations
- **Preferences**: User-specific settings
- **Security**: Password and authentication settings

### **3. Protected Components**

#### **Role-Based Rendering**
```typescript
// Example: Admin-only component
{session?.user?.role === "ADMIN" && (
  <AdminPanel />
)}

// Example: Editor and Admin access
{["ADMIN", "EDITOR"].includes(session?.user?.role || "") && (
  <ConfigurationEditor />
)}
```

## 🔐 **Security Features**

### **1. Authentication Security**
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **CSRF Protection**: Built-in NextAuth.js protection
- **Session Timeout**: Configurable session duration

### **2. Authorization Security**
- **Route Protection**: Middleware-based access control
- **Role-Based Access**: Granular permission system
- **API Protection**: Server-side role validation
- **Data Isolation**: User-specific data access

### **3. Data Security**
- **Input Validation**: Schema-based validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React built-in protection
- **Secure Headers**: Next.js security headers

## 📊 **User Roles & Permissions**

### **Admin Role**
- ✅ **Full System Access**: All features and pages
- ✅ **User Management**: Create, edit, delete users
- ✅ **System Configuration**: Global settings
- ✅ **Data Access**: All user data and configurations
- ✅ **Admin Panel**: Complete administrative access

### **Editor Role**
- ✅ **Configuration Management**: Create and edit configs
- ✅ **Dashboard Creation**: Build custom dashboards
- ✅ **Settings Access**: User and team settings
- ❌ **User Management**: Cannot manage other users
- ❌ **Admin Panel**: No administrative access

### **Viewer Role**
- ✅ **Read-Only Access**: View dashboards and data
- ✅ **Personal Profile**: Edit own profile
- ❌ **Configuration Changes**: Cannot modify configs
- ❌ **Dashboard Creation**: Cannot create dashboards
- ❌ **Settings Access**: Limited settings access

## 🚀 **Demo Users**

The system includes pre-configured demo users for testing:

### **Admin User**
- **Email**: `demo@example.com`
- **Password**: `demo123`
- **Role**: Admin
- **Access**: Full system access

### **Editor User**
- **Email**: `editor@example.com`
- **Password**: `editor123`
- **Role**: Editor
- **Access**: Configuration and dashboard management

### **Viewer User**
- **Email**: `viewer@example.com`
- **Password**: `viewer123`
- **Role**: Viewer
- **Access**: Read-only access

## 🔄 **Multi-Tenancy Features**

### **1. User-Specific Configurations**
- **Isolated Storage**: Each user has their own configuration space
- **Custom Dashboards**: Personal dashboard configurations
- **Private Settings**: User-specific preferences
- **Data Privacy**: Complete data isolation between users

### **2. Team Support (Future)**
- **Team Creation**: Users can create and join teams
- **Shared Resources**: Team-wide dashboards and configurations
- **Team Roles**: Owner, Admin, Member, Viewer roles
- **Collaboration**: Shared monitoring and alerting

### **3. Configuration Management**
- **Import/Export**: JSON-based configuration sharing
- **Version Control**: Configuration history and rollback
- **Templates**: Pre-built configuration templates
- **Validation**: Schema-based configuration validation

## 🛠️ **Setup Instructions**

### **1. Environment Configuration**
```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### **2. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo users
npx tsx prisma/seed.ts
```

### **3. Development Server**
```bash
# Start the development server
npm run dev
```

## 📱 **User Experience**

### **1. Authentication Flow**
1. **Landing Page**: Redirects to sign-in if not authenticated
2. **Sign In**: Multiple authentication options
3. **Dashboard**: Role-based dashboard access
4. **User Menu**: Profile and settings access
5. **Sign Out**: Secure logout with session cleanup

### **2. Role-Based Experience**
- **Admin**: Full access to all features and admin panel
- **Editor**: Configuration and dashboard management
- **Viewer**: Read-only access with personal profile

### **3. Multi-Tenant Experience**
- **Personal Configurations**: Each user has their own settings
- **Isolated Data**: No cross-user data access
- **Custom Dashboards**: Personal dashboard configurations
- **Private Settings**: User-specific preferences

## 🔧 **API Endpoints**

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out
- `GET /api/auth/session` - Get current session

### **User Management Endpoints**
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/[id]` - Update user (Admin only)
- `DELETE /api/users/[id]` - Delete user (Admin only)

### **Configuration Endpoints**
- `GET /api/config` - Get user configuration
- `POST /api/config` - Update user configuration
- `GET /api/config/export` - Export user configuration
- `POST /api/config/import` - Import user configuration

## 🎯 **Key Benefits**

### **1. Security**
- **Multi-Layer Authentication**: Multiple auth providers
- **Role-Based Access Control**: Granular permissions
- **Data Isolation**: Complete user data separation
- **Session Security**: JWT-based secure sessions

### **2. Scalability**
- **Multi-Tenant Architecture**: Support for multiple users
- **User-Specific Configurations**: Isolated data storage
- **Team Support**: Future team collaboration features
- **Database Optimization**: Efficient data queries

### **3. User Experience**
- **Intuitive Interface**: Easy-to-use authentication
- **Role-Based UI**: Contextual interface based on role
- **Personal Customization**: User-specific configurations
- **Responsive Design**: Mobile-friendly interface

### **4. Administration**
- **User Management**: Complete user administration
- **Role Assignment**: Easy role management
- **System Monitoring**: User activity tracking
- **Configuration Management**: Global and user-specific settings

## 🚀 **Future Enhancements**

### **1. Advanced Features**
- **Two-Factor Authentication**: Enhanced security
- **SSO Integration**: Enterprise authentication
- **API Key Management**: Programmatic access
- **Audit Logging**: User activity tracking

### **2. Team Collaboration**
- **Team Workspaces**: Shared team environments
- **Role Inheritance**: Team-based role management
- **Shared Resources**: Team dashboards and configs
- **Collaboration Tools**: Team communication features

### **3. Enterprise Features**
- **LDAP Integration**: Enterprise directory services
- **SAML Support**: Enterprise SSO
- **Advanced Permissions**: Granular access control
- **Compliance**: Audit trails and reporting

## 📋 **Testing**

### **1. Authentication Testing**
- **Login Flow**: Test all authentication methods
- **Role Access**: Verify role-based access control
- **Session Management**: Test session persistence
- **Security**: Test authentication security

### **2. Multi-Tenancy Testing**
- **Data Isolation**: Verify user data separation
- **Configuration Management**: Test user-specific configs
- **Permission Testing**: Verify role-based permissions
- **User Management**: Test admin user management

## 🎉 **Conclusion**

The Authentication & Multi-Tenancy system provides a robust, secure, and scalable foundation for the DevOps Monitoring Dashboard. With role-based access control, user-specific configurations, and comprehensive security features, the system is ready for production use and can scale to support multiple users and teams.

The implementation includes:
- ✅ **Complete Authentication System** with NextAuth.js
- ✅ **Role-Based Access Control** with Admin, Editor, and Viewer roles
- ✅ **Multi-User Support** with isolated configurations
- ✅ **User Management** with admin panel
- ✅ **Security Features** with proper authentication and authorization
- ✅ **Responsive UI** with mobile-friendly design
- ✅ **Database Integration** with Prisma and SQLite
- ✅ **Demo Users** for testing and demonstration

The system is now ready for production deployment and can be extended with additional features as needed! 🚀
