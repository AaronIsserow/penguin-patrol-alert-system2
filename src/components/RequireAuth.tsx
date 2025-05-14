import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFieldAgent?: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  requireAdmin = false,
  requireFieldAgent = false 
}) => {
  const { user, profile, isLoading, isAdmin, isFieldAgent } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    if (user && profile) {
      console.log("Current user role:", profile.role);
      console.log("Is admin:", isAdmin);
      console.log("Is field agent:", isFieldAgent);
    }
  }, [user, profile, isAdmin, isFieldAgent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireAdmin && !isAdmin) {
    console.log("Access denied: Admin role required");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireFieldAgent && !isFieldAgent && !isAdmin) {
    console.log("Access denied: Field Agent role required");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
