import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard");
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
