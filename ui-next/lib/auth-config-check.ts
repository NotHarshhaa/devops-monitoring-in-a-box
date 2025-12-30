/**
 * Auth Configuration Check
 * Validates NextAuth configuration and provides helpful error messages
 */

export function checkAuthConfig() {
  const issues: string[] = []
  const warnings: string[] = []

  // Check NEXTAUTH_SECRET
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === "your-secret-key-here") {
    if (process.env.NODE_ENV === "production") {
      issues.push(
        "NEXTAUTH_SECRET is not set or is using the default value. " +
        "Please set a secure secret key in production."
      )
    } else {
      warnings.push(
        "NEXTAUTH_SECRET is not set. Using default development secret. " +
        "Set NEXTAUTH_SECRET in your .env.local file for production."
      )
    }
  }

  // Check NEXTAUTH_URL
  if (!process.env.NEXTAUTH_URL) {
    if (process.env.NODE_ENV === "production") {
      issues.push(
        "NEXTAUTH_URL is not set. " +
        "Please set NEXTAUTH_URL to your production URL (e.g., https://your-domain.com)."
      )
    } else {
      warnings.push(
        "NEXTAUTH_URL is not set. " +
        "Defaulting to http://localhost:3000. " +
        "Set NEXTAUTH_URL in your .env.local file if running on a different port."
      )
    }
  } else {
    // Validate URL format
    try {
      new URL(process.env.NEXTAUTH_URL)
    } catch {
      issues.push(
        `NEXTAUTH_URL is set to an invalid URL: ${process.env.NEXTAUTH_URL}. ` +
        "Please set a valid URL (e.g., http://localhost:3000 or https://your-domain.com)."
      )
    }
  }

  // Log warnings
  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn("\n[NextAuth Configuration Warnings]")
    warnings.forEach((warning, index) => {
      console.warn(`${index + 1}. ${warning}`)
    })
    console.warn("\nTo fix these warnings, create a .env.local file with:")
    console.warn("NEXTAUTH_URL=http://localhost:3000")
    console.warn("NEXTAUTH_SECRET=your-secure-secret-key-here\n")
  }

  // Log issues (errors in production)
  if (issues.length > 0) {
    console.error("\n[NextAuth Configuration Errors]")
    issues.forEach((issue, index) => {
      console.error(`${index + 1}. ${issue}`)
    })
    console.error("\nPlease fix these issues before deploying to production.\n")
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  }
}

// Run check on module load (only in development)
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  checkAuthConfig()
}

