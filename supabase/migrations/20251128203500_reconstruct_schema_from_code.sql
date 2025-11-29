-- ==============================================================================
-- RECONSTRUCCIÓN DE ESQUEMA DE BASE DE DATOS - BILLMATE
-- ==============================================================================
-- Este archivo ha sido generado analizando el código fuente de la aplicación
-- para servir como script de recuperación en caso de pérdida total de la base de datos.
--
-- CONTIENE:
-- 1. Tablas Core (Profiles, Roles, Permissions)
-- 2. Tablas de Negocio (ServiceDefinitions, ServiceInstances)
-- 3. Sistema de Auditoría (AuditLogs + Auto Purge)
-- 4. Triggers y Funciones
-- 5. Políticas de Seguridad (RLS) - Corregidas para evitar recursión
-- ==============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SISTEMA DE ROLES Y PERMISOS (RBAC)
-- =====================================================

-- Tabla de Permisos (Capacidades atómicas)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- ej: 'service.create'
    description TEXT,
    module TEXT NOT NULL CHECK (module IN ('CORE', 'SOCIAL', 'ECOMMERCE', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- ej: 'SUPER_ADMIN', 'FREE_USER'
    label TEXT NOT NULL, -- ej: 'Super Administrador'
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Intermedia Roles <-> Permisos
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Datos Semilla (Seed Data) Básicos - Para asegurar funcionamiento inicial
INSERT INTO public.roles (name, label, description, is_system_role)
VALUES 
    ('SUPER_ADMIN', 'Super Admin', 'Acceso total al sistema', true),
    ('ADMIN', 'Administrador', 'Gestión de usuarios y soporte', true),
    ('PREMIUM_USER', 'Usuario Premium', 'Usuario con funciones avanzadas', true),
    ('FREE_USER', 'Usuario Gratuito', 'Usuario estándar', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. PERFILES DE USUARIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'FREE_USER' REFERENCES public.roles(name) ON UPDATE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'FREE_USER'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. LÓGICA DE NEGOCIO (SERVICIOS)
-- =====================================================

-- Definiciones de Servicio (Plantillas, ej: "Netflix", "Alquiler")
CREATE TABLE IF NOT EXISTS public.service_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT, -- Nombre del icono o URL
    color TEXT, -- Hex color
    category TEXT,
    is_system_service BOOLEAN DEFAULT false, -- Si es true, es una plantilla global
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instancias de Servicio (El pago real mensual)
CREATE TABLE IF NOT EXISTS public.service_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES public.service_definitions(id) ON DELETE SET NULL,
    
    -- Datos específicos de la instancia
    name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
    
    -- Configuración
    for_accounting BOOLEAN DEFAULT true,
    recurrence JSONB, -- Estructura { type: 'monthly', dayOfMonth: 5 }
    
    -- Alertas
    reminder_days_before INTEGER DEFAULT 3,
    daily_reminders INTEGER DEFAULT 1,
    
    -- Metadata de pago
    paid_at TIMESTAMPTZ,
    paid_amount DECIMAL(10, 2),
    receipt_url TEXT,
    notes TEXT,
    external_payment_id TEXT,
    
    -- Campos desnormalizados (cache visual)
    icon TEXT,
    color TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SISTEMA DE AUDITORÍA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_category TEXT NOT NULL,
    action_description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para optimizar la purga automática
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Función helper para insertar logs
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_user_email TEXT,
    p_action_type TEXT,
    p_action_category TEXT,
    p_action_description TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, user_email, action_type, action_category, 
        action_description, metadata, ip_address, user_agent
    ) VALUES (
        p_user_id, p_user_email, p_action_type, p_action_category, 
        p_action_description, p_metadata, p_ip_address, p_user_agent
    )
    RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de purga automática (Logs > 2 días)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < (NOW() - INTERVAL '2 days');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de purga automática
DROP TRIGGER IF EXISTS trigger_auto_purge_logs ON public.audit_logs;
CREATE TRIGGER trigger_auto_purge_logs
    AFTER INSERT ON public.audit_logs
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.purge_old_audit_logs();

-- =====================================================
-- 5. SEGURIDAD (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Funciones Helper para RLS (Evitan recursión infinita)
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Política corregida para Admins (usa función segura)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    auth.uid() = id OR public.is_admin_or_super_admin()
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
    auth.uid() = id OR public.is_admin_or_super_admin()
);

-- Políticas Services
DROP POLICY IF EXISTS "Users can CRUD own definitions" ON public.service_definitions;
CREATE POLICY "Users can CRUD own definitions" ON public.service_definitions USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own instances" ON public.service_instances;
CREATE POLICY "Users can CRUD own instances" ON public.service_instances USING (auth.uid() = user_id);

-- Políticas Roles/Permissions (Lectura pública autenticada, escritura Admin)
DROP POLICY IF EXISTS "Auth users can read roles" ON public.roles;
CREATE POLICY "Auth users can read roles" ON public.roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth users can read permissions" ON public.permissions;
CREATE POLICY "Auth users can read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);

-- Políticas Audit Logs
DROP POLICY IF EXISTS "SUPER_ADMIN can view all audit logs" ON public.audit_logs;
CREATE POLICY "SUPER_ADMIN can view all audit logs" ON public.audit_logs FOR SELECT USING ( public.is_super_admin() );

DROP POLICY IF EXISTS "SUPER_ADMIN can delete audit logs" ON public.audit_logs;
CREATE POLICY "SUPER_ADMIN can delete audit logs" ON public.audit_logs FOR DELETE USING ( public.is_super_admin() );

DROP POLICY IF EXISTS "System insert logs" ON public.audit_logs;
CREATE POLICY "System insert logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Permisos de ejecución para funciones RLS
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
