import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, BarChart3, FileText, Bell, Settings, Shield } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard");
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl mr-4">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              DevOps Monitor
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Comprehensive monitoring solution for your DevOps infrastructure. 
            Monitor services, metrics, logs, and alerts all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Real-time Metrics</CardTitle>
              <CardDescription>
                Monitor system performance with live metrics and customizable dashboards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Centralized Logs</CardTitle>
              <CardDescription>
                Aggregate and search logs from all your services in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Smart Alerts</CardTitle>
              <CardDescription>
                Get notified instantly when issues occur with intelligent alerting
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <Shield className="h-8 w-8 text-purple-600 mb-2 mx-auto" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure multi-tenant system with Admin, Editor, and Viewer roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-red-600">Admin</div>
                  <div className="text-gray-600">Full access</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">Editor</div>
                  <div className="text-gray-600">Configure & view</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">Viewer</div>
                  <div className="text-gray-600">Read-only access</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>Built with ❤️ by Harshhaa</p>
        </div>
      </div>
    </div>
  );
}
