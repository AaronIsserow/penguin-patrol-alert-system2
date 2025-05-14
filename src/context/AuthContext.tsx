import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthState, UserProfile } from "@/types/auth";
import { toast } from "@/hooks/use-toast";
import { getUserProfile, getManualUserProfile } from "@/lib/rpcFunctions";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isFieldAgent: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_KEY = "hbds-profile-cache";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string, useCache = true) => {
    try {
      if (useCache) {
        const cached = localStorage.getItem(PROFILE_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.id === userId) {
              return parsed;
            }
          } catch {}
        }
      }
      // Use our custom helper function to get the user profile
      const profile = await getUserProfile(userId);
      if (profile) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      }
      return profile;
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      return null;
    }
  };

  // Function to refresh the user profile data
  const refreshProfile = async () => {
    if (!authState.user) return;
    try {
      const profile = await fetchUserProfile(authState.user.id, false);
      setAuthState(prev => ({
        ...prev,
        profile,
      }));
      if (profile) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      }
      console.log("[DEBUG] Profile refreshed. Current role:", profile?.role, "Full profile:", profile);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Initialize auth state by checking for existing session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        if (session?.user) {
          setTimeout(async () => {
            // Use cache for instant UI
            const cachedProfile = await fetchUserProfile(session.user.id, true);
            setAuthState({
              user: session.user,
              profile: cachedProfile,
              isLoading: false,
            });
            // Update in background
            fetchUserProfile(session.user.id, false).then((freshProfile) => {
              if (freshProfile) {
                setAuthState({
                  user: session.user,
                  profile: freshProfile,
                  isLoading: false,
                });
              }
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
          });
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Use cache for instant UI
        const cachedProfile = await fetchUserProfile(session.user.id, true);
        setAuthState({
          user: session.user,
          profile: cachedProfile,
          isLoading: false,
        });
        // Update in background
        fetchUserProfile(session.user.id, false).then((freshProfile) => {
          if (freshProfile) {
            setAuthState({
              user: session.user,
              profile: freshProfile,
              isLoading: false,
            });
          }
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }
    };

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // User authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Account Created",
        description: "Please check your email for verification.",
      });
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Optionally log error, but don't block sign out
      console.error("Sign out error:", error);
    } finally {
      setAuthState({
        user: null,
        profile: null,
        isLoading: false,
        });
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    }
  };

  // Role checking helpers - make sure these work even if profile is null
  const isAdmin = authState.profile?.role === "admin";
  const isFieldAgent = authState.profile?.role === "field_agent";
  const isViewer = authState.profile?.role === "viewer" || !authState.profile?.role;

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAdmin,
    isFieldAgent,
    isViewer,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
