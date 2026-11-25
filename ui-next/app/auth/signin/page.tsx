import { isDemoAuthEnabled } from "@/lib/auth-simple"
import SignInClient from "./sign-in-client"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  return <SignInClient demoAuthEnabled={isDemoAuthEnabled()} />
}
