
-- Asegúrate de tener la extensión pgcrypto habilitada (generalmente lo está por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Crear Usuario Gratis (Trial)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'usuario_gratis@prueba.com',
    crypt('password123', gen_salt('bf')), -- Contraseña: password123
    now(),
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- El trigger 'on_auth_user_created' creará automáticamente el perfil con rol 'trial'


-- 2. Crear Usuario Pro (Paid)
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'usuario_pro@prueba.com',
    crypt('password123', gen_salt('bf')), -- Contraseña: password123
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  );

  -- Actualizar inmediatamente el rol a 'paid'
  -- El trigger habrá creado el perfil como 'trial' al insertar el usuario
  -- Esperamos brevemente o simplemente actualizamos (Postgres maneja transacciones, pero el trigger es sincrónico)
  
  UPDATE public.profiles
  SET role = 'paid'
  WHERE id = new_user_id;
  
END $$;
