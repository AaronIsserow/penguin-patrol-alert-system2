import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const UserMenu: React.FC = () => {
  const { user, profile, signOut, isAdmin, isFieldAgent, isViewer, refreshProfile } = useAuth();

  // Attempt to refresh profile on mount
  useEffect(() => {
    if (user) {
      console.log("UserMenu: Refreshing profile on mount");
      refreshProfile();
    }
  }, [user, refreshProfile]);

  if (!user) {
    return (
      <Button variant="outline" asChild>
        <Link to="/auth">Login</Link>
      </Button>
    );
  }

  // Debug: Log the role being displayed
  console.log("[DEBUG] UserMenu displaying role:", profile?.role);

  const getRoleBadge = () => {
    if (isAdmin) {
      return <Badge className="bg-red-500">Admin</Badge>;
    } else if (isFieldAgent) {
      return <Badge className="bg-yellow-500">Field Agent</Badge>;
    } else {
      return <Badge className="bg-blue-500">Viewer</Badge>;
    }
  };

  const handleRefreshRole = async () => {
    toast({
      title: "Refreshing Profile",
      description: "Updating your role information...",
    });
    
    await refreshProfile();
    
    // Force a component update
    setTimeout(() => {
      toast({
        title: "Profile Refreshed",
        description: `Current role: ${profile?.role || "viewer"}`,
      });
    }, 500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[120px]">
          <User className="h-4 w-4 text-primary font-semibold" />
          <span className="text-primary font-semibold truncate">{user.email?.split('@')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <span>Account</span>
          {getRoleBadge()}
        </DropdownMenuLabel>
        <DropdownMenuItem className="text-xs opacity-70">
          Role: {profile?.role || "viewer"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRefreshRole}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Role
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
