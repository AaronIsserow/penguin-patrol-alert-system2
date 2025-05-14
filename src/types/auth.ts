
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "viewer" | "field_agent";

export interface UserProfile {
  id: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}
