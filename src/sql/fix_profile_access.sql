
-- First, let's create a secure way to get user profiles
-- This avoids RLS recursion issues
CREATE OR REPLACE FUNCTION public.get_user_profile_by_id(user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'role', role
  )
  INTO user_profile
  FROM profiles
  WHERE id = user_id;
  
  RETURN user_profile;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_id(UUID) TO authenticated;

-- Function to create RPC function programmatically
CREATE OR REPLACE FUNCTION public.create_rpc_function()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Function implementation is in the function above
  -- This is just a stub to call from client-side
  RETURN;
END;
$$;
