// RequireAuth: Protects routes and components based on authentication and role
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Props for RequireAuth (children and optional role requirements)
interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFieldAgent?: boolean;
}

// Main auth guard component
const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  requireAdmin = false,
  requireFieldAgent = false 
}) => {
  const { user, profile, isLoading, isAdmin, isFieldAgent } = useAuth();
  const location = useLocation();

  // Debug logging for user role
  useEffect(() => {
    if (user && profile) {
      console.log("Current user role:", profile.role);
      console.log("Is admin:", isAdmin);
      console.log("Is field agent:", isFieldAgent);
    }
  }, [user, profile, isAdmin, isFieldAgent]);

  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for admin role if required
  if (requireAdmin && !isAdmin) {
    console.log("Access denied: Admin role required");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for field agent role if required
  if (requireFieldAgent && !isFieldAgent && !isAdmin) {
    console.log("Access denied: Field Agent role required");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render children if access is allowed
  return <>{children}</>;
};

export default RequireAuth;
