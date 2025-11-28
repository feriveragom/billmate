-- Migration: Roles and Permissions System
-- Description: Create tables for roles and permissions management
-- Date: 2025-11-28

-- 1. Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    module TEXT NOT NULL CHECK (module IN ('CORE', 'SOCIAL', 'ECOMMERCE', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name IN ('FREE_USER', 'PREMIUM_USER', 'ADMIN', 'SUPER_ADMIN')),
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    is_system_role BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create role_permissions junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Insert default permissions
INSERT INTO public.permissions (code, description, module) VALUES
    -- CORE Permissions
    ('service.create', 'Crear servicios', 'CORE'),
    ('service.view', 'Ver servicios propios', 'CORE'),
    ('service.edit', 'Editar servicios propios', 'CORE'),
    ('service.delete', 'Eliminar servicios propios', 'CORE'),
    ('premium.features', 'Acceso a funciones premium', 'CORE'),
    
    -- ADMIN Permissions
    ('admin.access', 'Acceder al panel de admin', 'ADMIN'),
    ('admin.users.manage', 'Gestionar usuarios (ban/promover)', 'ADMIN'),
    ('admin.roles.manage', 'Gestionar roles y permisos', 'ADMIN'),
    ('admin.logs.view', 'Ver logs de auditoría', 'ADMIN')
ON CONFLICT (code) DO NOTHING;

-- 5. Insert default roles
INSERT INTO public.roles (name, label, description, is_system_role) VALUES
    ('SUPER_ADMIN', 'Super Administrador', 'Control total del sistema y gestión de admins', TRUE),
    ('ADMIN', 'Administrador', 'Gestión de usuarios y soporte', TRUE),
    ('PREMIUM_USER', 'Usuario Premium', 'Acceso ilimitado a funcionalidades avanzadas', TRUE),
    ('FREE_USER', 'Usuario Gratuito', 'Acceso estándar con límites de uso', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 6. Assign permissions to roles
DO $$
DECLARE
    role_super_admin UUID;
    role_admin UUID;
    role_premium UUID;
    role_free UUID;
    perm_service_create UUID;
    perm_service_view UUID;
    perm_service_edit UUID;
    perm_service_delete UUID;
    perm_premium_features UUID;
    perm_admin_access UUID;
    perm_admin_users UUID;
    perm_admin_roles UUID;
    perm_admin_logs UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO role_super_admin FROM public.roles WHERE name = 'SUPER_ADMIN';
    SELECT id INTO role_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO role_premium FROM public.roles WHERE name = 'PREMIUM_USER';
    SELECT id INTO role_free FROM public.roles WHERE name = 'FREE_USER';
    
    -- Get permission IDs
    SELECT id INTO perm_service_create FROM public.permissions WHERE code = 'service.create';
    SELECT id INTO perm_service_view FROM public.permissions WHERE code = 'service.view';
    SELECT id INTO perm_service_edit FROM public.permissions WHERE code = 'service.edit';
    SELECT id INTO perm_service_delete FROM public.permissions WHERE code = 'service.delete';
    SELECT id INTO perm_premium_features FROM public.permissions WHERE code = 'premium.features';
    SELECT id INTO perm_admin_access FROM public.permissions WHERE code = 'admin.access';
    SELECT id INTO perm_admin_users FROM public.permissions WHERE code = 'admin.users.manage';
    SELECT id INTO perm_admin_roles FROM public.permissions WHERE code = 'admin.roles.manage';
    SELECT id INTO perm_admin_logs FROM public.permissions WHERE code = 'admin.logs.view';
    
    -- SUPER_ADMIN: All permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
        (role_super_admin, perm_service_create),
        (role_super_admin, perm_service_view),
        (role_super_admin, perm_service_edit),
        (role_super_admin, perm_service_delete),
        (role_super_admin, perm_premium_features),
        (role_super_admin, perm_admin_access),
        (role_super_admin, perm_admin_users),
        (role_super_admin, perm_admin_roles),
        (role_super_admin, perm_admin_logs)
    ON CONFLICT DO NOTHING;
    
    -- ADMIN: All permissions (same as SUPER_ADMIN)
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
        (role_admin, perm_service_create),
        (role_admin, perm_service_view),
        (role_admin, perm_service_edit),
        (role_admin, perm_service_delete),
        (role_admin, perm_premium_features),
        (role_admin, perm_admin_access),
        (role_admin, perm_admin_users),
        (role_admin, perm_admin_roles),
        (role_admin, perm_admin_logs)
    ON CONFLICT DO NOTHING;
    
    -- PREMIUM_USER: Core + Premium features
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
        (role_premium, perm_service_create),
        (role_premium, perm_service_view),
        (role_premium, perm_service_edit),
        (role_premium, perm_service_delete),
        (role_premium, perm_premium_features)
    ON CONFLICT DO NOTHING;
    
    -- FREE_USER: Only core features
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
        (role_free, perm_service_create),
        (role_free, perm_service_view),
        (role_free, perm_service_edit),
        (role_free, perm_service_delete)
    ON CONFLICT DO NOTHING;
END $$;

-- 7. Add RLS policies for permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissions are viewable by everyone"
    ON public.permissions FOR SELECT
    USING (true);

CREATE POLICY "Only SUPER_ADMIN can manage permissions"
    ON public.permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 8. Add RLS policies for roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles are viewable by everyone"
    ON public.roles FOR SELECT
    USING (true);

CREATE POLICY "Only SUPER_ADMIN can manage roles"
    ON public.roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 9. Add RLS policies for role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role permissions are viewable by everyone"
    ON public.role_permissions FOR SELECT
    USING (true);

CREATE POLICY "Only SUPER_ADMIN can manage role permissions"
    ON public.role_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);

-- 11. Add comments for documentation
COMMENT ON TABLE public.permissions IS 'System permissions definitions';
COMMENT ON TABLE public.roles IS 'User roles with associated permissions';
COMMENT ON TABLE public.role_permissions IS 'Junction table mapping roles to permissions';
