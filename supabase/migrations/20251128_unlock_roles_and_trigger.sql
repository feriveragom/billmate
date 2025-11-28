-- 1. Eliminar restricciones que limitan los nombres de roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_name_check;

-- 2. (Opcional pero recomendado) Asegurar integridad referencial
-- Esto asegura que solo puedas asignar a un usuario un rol que exista en la tabla roles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_fkey'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_fkey 
        FOREIGN KEY (role) 
        REFERENCES public.roles(name) 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 3. Automatismo: Trigger para asignar nuevos permisos automáticamente al SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.auto_assign_permission_to_super_admin()
RETURNS TRIGGER AS $$
DECLARE
    v_super_admin_role_id UUID;
BEGIN
    -- Obtener ID del Super Admin
    SELECT id INTO v_super_admin_role_id FROM public.roles WHERE name = 'SUPER_ADMIN';

    -- Si existe el rol, asignar el nuevo permiso
    IF v_super_admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (v_super_admin_role_id, NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el disparador
DROP TRIGGER IF EXISTS on_permission_created ON public.permissions;
CREATE TRIGGER on_permission_created
    AFTER INSERT ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_permission_to_super_admin();

-- 4. Asegurar que RLS permite crear roles (Si no eres Super Admin ya está bloqueado, pero aseguramos policy)
-- Las policies actuales en la migración 20251128201736 ya restringen a SUPER_ADMIN, lo cual es correcto.
