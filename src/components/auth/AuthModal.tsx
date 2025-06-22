
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

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
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>(defaultTab);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

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

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
  });

  const clearError = () => {
    setAuthError(null);
    setSignUpSuccess(false);
    setForgotPasswordSent(false);
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

  const handleGoogleSignIn = async () => {
    if (formLoading || loading) return;
    
    setFormLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        const errorMessage = getErrorMessage(error);
        setAuthError(errorMessage);
        toast({
          title: "Google Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "Failed to sign in with Google. Please try again.";
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || loading) return;
    
    setFormLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordForm.email,
        {
          redirectTo: `${window.location.origin}/admin`,
        }
      );

      if (error) {
        const errorMessage = getErrorMessage(error);
        setAuthError(errorMessage);
        toast({
          title: "Reset Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        setForgotPasswordSent(true);
        toast({
          title: "Reset Email Sent!",
          description: "Check your email for password reset instructions.",
        });
        // Reset form
        setForgotPasswordForm({ email: '' });
      }
    } catch (error) {
      const errorMessage = "Failed to send reset email. Please try again.";
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
    setActiveTab(value as 'signin' | 'signup' | 'forgot');
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

        {forgotPasswordSent && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Password reset email sent! Check your inbox for further instructions.
            </AlertDescription>
          </Alert>
        )}

        {activeTab === 'forgot' ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('signin')}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter your email address and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordForm.email}
                    onChange={(e) => {
                      setForgotPasswordForm({...forgotPasswordForm, email: e.target.value});
                      clearError();
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Email...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </form>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

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

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setActiveTab('forgot')}
                      disabled={isLoading}
                      className="px-0 text-sm"
                    >
                      Forgot password?
                    </Button>
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
              </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
