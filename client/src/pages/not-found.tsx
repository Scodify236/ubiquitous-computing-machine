import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border/20">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-medium text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-6 flex justify-center">
            <a 
              href="/" 
              className="bg-primary hover:bg-primary/90 transition-colors text-white px-4 py-2 rounded-full flex items-center"
            >
              <span className="material-icons mr-2 text-sm">home</span>
              Return to Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
