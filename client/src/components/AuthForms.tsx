import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/index";
import { registerUser, loginUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Validation schema for login form
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Validation schema for register form with additional fields
const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  name: z
    .string()
    .min(1, { message: "Name is required" }),
  phone: z
    .string()
    .min(6, { message: "Phone number is required" })
    .regex(/^[+]?[\d\s-()]{6,20}$/, { message: "Invalid phone number format" }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const AuthForms = () => {
  const { login, setLoading, setError } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  // Handle login form submission
  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await loginUser(data.email, data.password);
      
      if (response.success) {
        // Use name and email from response if available
        login({ 
          email: data.email,
          name: response.name || 'User', // Default to 'User' if name not provided
          phone: response.phone 
        });
        
        toast({
          title: "Login successful",
          description: `Welcome back${response.name ? ', ' + response.name : ''}!`,
        });
      } else {
        setError(response.message);
        toast({
          title: "Login failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle register form submission
  const handleRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setIsRegistering(true);
      
      const response = await registerUser(data.email, data.password, data.name, data.phone);
      
      if (response.success) {
        // Include name and phone in the user object
        login({ 
          email: data.email,
          name: data.name,
          phone: data.phone 
        });
        
        toast({
          title: "Registration successful",
          description: `Welcome to Velin, ${data.name}!`,
        });
        
        // Switch to login tab after successful registration
        setActiveTab("login");
      } else {
        setError(response.message);
        toast({
          title: "Registration failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 bg-white dark:bg-zinc-900">
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-lg">
        <CardHeader className="space-y-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-red-600 text-4xl">podcasts</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Welcome to <span className="text-gray-900 dark:text-white font-normal">Velin</span>
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Sign in to continue to Velin
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 p-0.5">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 text-gray-600 dark:text-gray-300 py-2"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 text-gray-600 dark:text-gray-300 py-2"
              >
                Create Account
              </TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition mt-4"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    className="bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+1234567890"
                    className="bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    {...registerForm.register("phone")}
                  />
                  {registerForm.formState.errors.phone && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {registerForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition mt-4"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForms;