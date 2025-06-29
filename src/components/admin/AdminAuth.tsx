import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from 'lucide-react';

interface AdminAuthProps {
  children: React.ReactNode;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ children }) => {
  // ANONYMOUS AUTH - Always allow access
  const isAuthenticated = true;
  const isAdmin = true;

  /* COMMENTED OUT - Using anonymous auth
  const { isAuthenticated, isAdmin, login } = useAdminAuth();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Access Required</CardTitle>
            <CardDescription>
              Please authenticate to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                This area is restricted to authorized administrators only.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={login}
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  */

  // Anonymous mode notification
  if (isAuthenticated && isAdmin) {
    return (
      <>
        <div className="bg-yellow-50 border-b border-yellow-200 p-2 text-center">
          <p className="text-xs text-yellow-800">
            <Shield className="inline h-3 w-3 mr-1" />
            Anonymous Admin Mode - All features accessible
          </p>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
};

export default AdminAuth;
