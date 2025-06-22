
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  open, 
  onOpenChange, 
  defaultTab = 'signin' 
}) => {
  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  const clearError = () => {
    setAuthError(null);
    setSignUpSuccess(false);
  };

  const getErrorMessage = (error: any) => {
    if (!error) return null;
    
    const message = error.message || error.error_description || 'An unexpected error occurred';
    
    // Provide user-friendly error messages
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('signup is disabled')) {
      return 'Account creation is currently disabled. Please contact an administrator.';
    }
    
    return message;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || loading) return;
    
    setFormLoading(true);
    setAuthError(null);

    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      
      if (error) {
        const errorMessage = getErrorMessage(error);
        setAuthError(errorMessage);
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
        onOpenChange(false);
        // Reset form
        setSignInForm({ email: '', password: '' });
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setAuthError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || loading) return;
    
    setFormLoading(true);
    setAuthError(null);
    setSignUpSuccess(false);

    // Validate passwords match
    if (signUpForm.password !== signUpForm.confirmPassword) {
      const errorMessage = "Passwords do not match.";
      setAuthError(errorMessage);
      toast({
        title: "Password Mismatch",
        description: errorMessage,
        variant: "destructive",
      });
      setFormLoading(false);
      return;
    }

    // Validate password strength
    if (signUpForm.password.length < 6) {
      const errorMessage = "Password must be at least 6 characters long.";
      setAuthError(errorMessage);
      toast({
        title: "Weak Password",
        description: errorMessage,
        variant: "destructive",
      });
      setFormLoading(false);
      return;
    }

    try {
      const { error } = await signUp(
        signUpForm.email, 
        signUpForm.password, 
        signUpForm.fullName
      );
      
      if (error) {
        const errorMessage = getErrorMessage(error);
        setAuthError(errorMessage);
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        setSignUpSuccess(true);
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully.",
        });
        // Reset form
        setSignUpForm({ email: '', password: '', fullName: '', confirmPassword: '' });
        
        // Switch to sign in tab after successful signup
        setTimeout(() => {
          setActiveTab('signin');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setAuthError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'signin' | 'signup');
    clearError();
  };

  const isLoading = formLoading || loading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Access - ICUPA Malta</DialogTitle>
        </DialogHeader>

        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {signUpSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Account created successfully! You can now sign in.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your admin email"
                    value={signInForm.email}
                    onChange={(e) => {
                      setSignInForm({...signInForm, email: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={(e) => {
                      setSignInForm({...signInForm, password: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signUpForm.fullName}
                    onChange={(e) => {
                      setSignUpForm({...signUpForm, fullName: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpForm.email}
                    onChange={(e) => {
                      setSignUpForm({...signUpForm, email: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={signUpForm.password}
                    onChange={(e) => {
                      setSignUpForm({...signUpForm, password: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => {
                      setSignUpForm({...signUpForm, confirmPassword: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
