-- ==============================================================================
-- FIX: RECURSIÓN INFINITA EN POLÍTICAS RLS DE PROFILES
-- ==============================================================================
-- Problema: La política "Admins can view all profiles" consultaba la tabla 'profiles'
-- para verificar el rol, lo que disparaba nuevamente las políticas RLS de 'profiles',
-- creando un bucle infinito que dejaba la petición "Cargando..." indefinidamente.
--
-- Solución: Usar una función SECURITY DEFINER para verificar el rol.
-- Esta función se ejecuta con privilegios de sistema y salta las políticas RLS
-- durante su ejecución interna.
-- ==============================================================================

-- 1. Crear función segura para verificar rol de Admin/SuperAdmin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Esta consulta se ejecuta sin restricciones RLS gracias a SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear función segura específica para SuperAdmin (usada en logs)
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

-- 3. Corregir políticas de PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    -- El usuario puede ver su propio perfil OR es admin (usando la función segura)
    auth.uid() = id OR public.is_admin_or_super_admin()
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    -- El usuario puede editar su propio perfil OR es admin
    auth.uid() = id OR public.is_admin_or_super_admin()
  );

-- 4. Corregir políticas de AUDIT LOGS (para prevenir problemas similares)
DROP POLICY IF EXISTS "SUPER_ADMIN can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "SUPER_ADMIN can delete audit logs" ON public.audit_logs;

CREATE POLICY "SUPER_ADMIN can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING ( public.is_super_admin() );

CREATE POLICY "SUPER_ADMIN can delete audit logs"
  ON public.audit_logs
  FOR DELETE
  USING ( public.is_super_admin() );

-- 5. Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
