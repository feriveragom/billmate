-- =====================================================
-- SISTEMA DE AUDITORÍA - BILLMATE
-- =====================================================
-- Este script crea la infraestructura completa para el
-- sistema de logs de auditoría del panel de administración.
-- =====================================================

-- 1. Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario que ejecutó la acción
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  
  -- Detalles de la acción
  action_type TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'ROLE_CHANGE', etc.
  action_category TEXT NOT NULL, -- 'AUTH', 'USER_MANAGEMENT', 'SERVICE', 'PAYMENT', 'SYSTEM'
  action_description TEXT NOT NULL,
  
  -- Metadata adicional (JSON flexible)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Contexto de la petición
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para búsqueda rápida
  CONSTRAINT valid_action_type CHECK (action_type IN (
    'LOGIN', 'LOGOUT', 'SIGNUP',
    'CREATE', 'UPDATE', 'DELETE',
    'ROLE_CHANGE', 'BAN', 'UNBAN',
    'SYSTEM_CONFIG', 'OTHER'
  )),
  CONSTRAINT valid_category CHECK (action_category IN (
    'AUTH', 'USER_MANAGEMENT', 'SERVICE', 'PAYMENT', 'ADMIN', 'SYSTEM'
  ))
);

-- 2. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_category ON public.audit_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON public.audit_logs(user_email);

-- 3. Activar Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad
-- Solo SUPER_ADMIN puede leer logs
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

-- Solo SUPER_ADMIN puede eliminar logs
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

-- Sistema puede insertar logs (desde funciones server-side)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- 5. Función helper para registrar logs
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
    user_id,
    user_email,
    action_type,
    action_category,
    action_description,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_user_email,
    p_action_type,
    p_action_category,
    p_action_description,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger automático: Log de nuevos registros
CREATE OR REPLACE FUNCTION public.log_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action_type,
    action_category,
    action_description,
    metadata
  ) VALUES (
    NEW.id,
    NEW.email,
    'SIGNUP',
    'AUTH',
    'Nuevo usuario registrado vía Google OAuth',
    jsonb_build_object(
      'provider', 'google',
      'full_name', NEW.raw_user_meta_data->>'full_name'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activar trigger de signup
DROP TRIGGER IF EXISTS on_user_signup_log ON auth.users;
CREATE TRIGGER on_user_signup_log
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.log_user_signup();

-- 7. Función para limpiar logs antiguos (opcional, para mantenimiento)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Para ejecutar limpieza manual:
-- SELECT public.cleanup_old_audit_logs(90); -- Elimina logs > 90 días
-- =====================================================
