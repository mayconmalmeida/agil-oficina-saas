
-- Create RPC function to check if user is admin by user ID
CREATE OR REPLACE FUNCTION public.is_user_admin_by_id(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'superadmin')
  );
END;
$function$;
