-- Migration: Update Roles System
-- Description: Add ADMIN and PREMIUM_USER roles, remove GUEST role
-- Date: 2025-11-28

-- 1. Drop existing CHECK constraint on role column (if exists)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add new CHECK constraint with updated roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('FREE_USER', 'PREMIUM_USER', 'ADMIN', 'SUPER_ADMIN'));

-- 3. Update any existing users with invalid roles to FREE_USER (safety measure)
UPDATE public.profiles 
SET role = 'FREE_USER' 
WHERE role NOT IN ('FREE_USER', 'PREMIUM_USER', 'ADMIN', 'SUPER_ADMIN');

-- 4. Ensure default role is still FREE_USER
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'FREE_USER';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.role IS 
'User role: FREE_USER (default), PREMIUM_USER (paid), ADMIN (support), SUPER_ADMIN (full access)';
