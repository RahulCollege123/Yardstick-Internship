"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Form Section */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-xl border border-border">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <i className="fas fa-sticky-note text-primary text-2xl"></i>
                  <h1 className="text-2xl font-bold text-foreground">NotesHub</h1>
                </div>
                <p className="text-muted-foreground text-sm">Multi-tenant notes application</p>
              </div>

              <div className="flex space-x-2 bg-muted rounded-lg p-1">
                <Button
                  variant={isLogin ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsLogin(true)}
                  className="flex-1"
                  data-testid="button-login-tab"
                >
                  Login
                </Button>
                <Button
                  variant={!isLogin ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsLogin(false)}
                  className="flex-1"
                  data-testid="button-register-tab"
                >
                  Register
                </Button>
              </div>

              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" data-testid="form-login">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@acme.test"
                      {...loginForm.register("email")}
                      data-testid="input-login-email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-destructive text-sm" data-testid="error-login-email">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="password"
                      {...loginForm.register("password")}
                      data-testid="input-login-password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-destructive text-sm" data-testid="error-login-password">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-login-submit"
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4" data-testid="form-register">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      {...registerForm.register("email")}
                      data-testid="input-register-email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-destructive text-sm" data-testid="error-register-email">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Enter password"
                      {...registerForm.register("password")}
                      data-testid="input-register-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-destructive text-sm" data-testid="error-register-password">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      {...registerForm.register("confirmPassword")}
                      data-testid="input-register-confirm-password"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-destructive text-sm" data-testid="error-register-confirm-password">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-register-submit"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}

              <div className="bg-muted rounded-md p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Test Accounts:</p>
                <p>admin@acme.test / user@acme.test</p>
                <p>admin@globex.test / user@globex.test</p>
                <p className="mt-1 font-mono">Password: password</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <div className="hidden lg:flex items-center justify-center bg-primary/5 rounded-lg">
          <div className="text-center space-y-6 p-12">
            <div className="space-y-4">
              <i className="fas fa-sticky-note text-primary text-6xl"></i>
              <h2 className="text-3xl font-bold text-foreground">Welcome to NotesHub</h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Organize your thoughts, collaborate with your team, and boost productivity with our secure multi-tenant notes platform.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-left max-w-sm">
              <div className="flex items-center space-x-3">
                <i className="fas fa-shield-alt text-primary text-lg"></i>
                <span className="text-sm text-foreground">Secure multi-tenant architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-users text-primary text-lg"></i>
                <span className="text-sm text-foreground">Role-based access control</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-rocket text-primary text-lg"></i>
                <span className="text-sm text-foreground">Scalable subscription plans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
