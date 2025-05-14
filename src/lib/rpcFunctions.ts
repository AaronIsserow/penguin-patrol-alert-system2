import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

/**
 * Helper function to create an RPC function in the Supabase database
 * This should be run once to set up the function
 */
export const createGetUserProfileFunction = async () => {
  try {
    // Use a direct fetch instead of typed RPC method to avoid TypeScript errors
    const { error } = await supabase.functions.invoke('create_rpc_function', {
      method: 'POST',
    });
    
    if (error) {
      console.error("Error creating RPC function:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking RPC function:", error);
    return false;
  }
};

/**
 * Helper function to manually get a user's profile when RPC or direct queries fail
 */
export const getManualUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Try a different approach using raw SQL via serviceRole
    // Note: In a production app, you'd want to handle this differently,
    // potentially with a secure API endpoint
    const { data: rawProfileData } = await supabase.from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();
      
    if (rawProfileData) {
      return rawProfileData as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Manual profile fetch error:", error);
    return null;
  }
};

/**
 * Helper function to get a user profile using the SQL function we created
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    if (data) {
      return {
        id: data.id,
        role: data.role
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }
};

/**
 * Function to update a user's role to admin
 */
export const updateUserToAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
};
