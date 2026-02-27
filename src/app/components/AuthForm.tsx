import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase, apiUrl } from "../utils/supabase";
import { publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface AuthFormProps {
  onAuthSuccess: (accessToken: string, userName: string, userRole: string, userId: string) => void;
}

const ALLOWED_EMAIL_DOMAINS = ["beyond-wm.com", "beyondgm.com"];

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const validateEmailDomain = (email: string): boolean => {
    const emailDomain = email.split("@")[1]?.toLowerCase();
    return ALLOWED_EMAIL_DOMAINS.includes(emailDomain);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || "Failed to login");
        setIsLoading(false);
        return;
      }

      if (data.session?.access_token && data.user?.user_metadata?.name) {
        toast.success("Welcome back!");
        onAuthSuccess(
          data.session.access_token, 
          data.user.user_metadata.name, 
          data.user.user_metadata.role || 'user',
          data.user.id
        );
      }
    } catch (err) {
      console.error('Login exception:', err);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email domain before proceeding
    if (!validateEmailDomain(signupData.email)) {
      toast.error(
        `Email must be from an authorized domain: ${ALLOWED_EMAIL_DOMAINS.join(" or ")}`
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          name: signupData.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Signup error:', result);
        toast.error(result.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // After successful signup, automatically log in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password,
      });

      if (error) {
        console.error('Auto-login error after signup:', error);
        toast.success("Account created! Please log in.");
        setIsLoading(false);
        return;
      }

      if (data.session?.access_token && data.user) {
        toast.success("Account created successfully!");
        onAuthSuccess(
          data.session.access_token, 
          data.user.user_metadata?.name || signupData.name, 
          data.user.user_metadata?.role || result.user?.user_metadata?.role || 'user',
          data.user.id
        );
      }
    } catch (err) {
      console.error('Signup exception:', err);
      toast.error("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/logo-dark.png"
              alt="Beyond International"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold">Beyond International</h1>
          <p className="text-muted-foreground">
            Secure investor tracking system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to access your EB5 investor dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@beyond-wm.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Company Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@beyond-wm.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must use @beyond-wm.com or @beyondgm.com email
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}