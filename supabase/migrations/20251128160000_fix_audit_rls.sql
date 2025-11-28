-- =====================================================
-- ACTUALIZACIÓN POLÍTICAS RLS - AUDIT LOGS
-- =====================================================

-- Eliminar políticas antiguas si existen para evitar conflictos
DROP POLICY IF EXISTS "SUPER_ADMIN can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "SUPER_ADMIN can delete audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- 1. Política de Lectura (SELECT)
-- SUPER_ADMIN puede ver TODO.
-- Los usuarios normales NO pueden ver logs (por seguridad).
CREATE POLICY "SUPER_ADMIN can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  );

-- 2. Política de Eliminación (DELETE)
-- Solo SUPER_ADMIN puede borrar logs.
CREATE POLICY "SUPER_ADMIN can delete audit logs"
  ON public.audit_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  );

-- 3. Política de Inserción (INSERT)
-- Permitir que CUALQUIER usuario autenticado (o el sistema) pueda crear un log.
-- Esto es necesario para que cuando un usuario normal hace algo (ej: login),
-- se pueda guardar el registro en la tabla.
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Política adicional para service_role (backend) por si acaso
CREATE POLICY "Service role can do everything"
  ON public.audit_logs
  USING ( auth.role() = 'service_role' )
  WITH CHECK ( auth.role() = 'service_role' );

