import { useEffect } from "react";
import { useLocation } from "wouter";
import AuthForms from "@/components/AuthForms";
import { useAuthStore } from "@/store/index";

const Auth = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AuthForms />
      </div>
    </main>
  );
};

export default Auth;