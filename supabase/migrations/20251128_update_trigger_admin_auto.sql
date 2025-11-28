-- 3. Automatismo MEJORADO: Trigger para asignar nuevos permisos a SUPER_ADMIN y ADMIN
CREATE OR REPLACE FUNCTION public.auto_assign_permission_to_protected_roles()
RETURNS TRIGGER AS $$
DECLARE
    v_super_admin_role_id UUID;
    v_admin_role_id UUID;
BEGIN
    -- Obtener IDs de los roles protegidos
    SELECT id INTO v_super_admin_role_id FROM public.roles WHERE name = 'SUPER_ADMIN';
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'ADMIN';

    -- 1. Asignar a SUPER_ADMIN (Siempre)
    IF v_super_admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (v_super_admin_role_id, NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 2. Asignar a ADMIN (También siempre, según requerimiento)
    IF v_admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (v_admin_role_id, NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el disparador apuntando a la nueva función
DROP TRIGGER IF EXISTS on_permission_created ON public.permissions;
CREATE TRIGGER on_permission_created
    AFTER INSERT ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_permission_to_protected_roles();

