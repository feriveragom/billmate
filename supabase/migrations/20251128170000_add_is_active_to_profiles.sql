-- Añadir columna de estado a profiles
ALTER TABLE public.profiles 
ADD COLUMN is_active boolean DEFAULT true;

-- Actualizar la vista segura de usuarios si existe o asegurarnos que sea accesible
-- (En tu caso usamos profiles directamente, así que esto es suficiente)

-- Comentario para documentación
COMMENT ON COLUMN public.profiles.is_active IS 'Controla si el usuario puede iniciar sesión en la aplicación';

