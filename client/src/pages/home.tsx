import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Application
          </h1>
          <p className="text-lg text-gray-600">
            Your application has been successfully migrated to Replit and is now running!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Migration Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your project has been successfully migrated from Replit Agent to the Replit environment.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>🔧 Ready to Build</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The application is running on port 5000 with proper client-server separation and security practices.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📚 Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                React with Vite, Express server, Drizzle ORM, and TypeScript - all configured and ready.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}