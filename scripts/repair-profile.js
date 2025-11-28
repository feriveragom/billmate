const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitamos la clave de servicio para saltarnos RLS

// Si no tienes la SERVICE_ROLE_KEY en .env.local, usa la ANON_KEY pero podría fallar si RLS es estricto
const KEY_TO_USE = SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !KEY_TO_USE) {
    console.error("❌ Faltan variables de entorno.");
    console.error("Asegúrate de tener SUPABASE_URL y (opcionalmente) SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY_TO_USE);

async function repairProfile() {
    const userId = '987e578c-a1dd-44cf-9d61-155b96152326';
    const email = 'feriveragom@gmail.com';
    const fullName = 'Fernando Rivera Gómez';
    const avatarUrl = 'https://lh3.googleusercontent.com/a/ACg8ocIZ...'; // URL genérica o la real si la tienes

    console.log(`🛠️ Intentando reparar perfil para: ${email} (${userId})`);

    // 1. Verificar si existe
    const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existing) {
        console.log("⚠️ El perfil YA existe:", existing);
        console.log("🔄 Actualizando rol a SUPER_ADMIN...");
        
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'SUPER_ADMIN' })
            .eq('id', userId);

        if (updateError) console.error("❌ Error actualizando:", updateError);
        else console.log("✅ Perfil actualizado a SUPER_ADMIN correctamente.");
        
    } else {
        console.log("✨ El perfil NO existe. Creándolo desde cero...");
        
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                email: email,
                full_name: fullName,
                avatar_url: avatarUrl,
                role: 'SUPER_ADMIN',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (insertError) {
            console.error("❌ Error creando perfil:", insertError);
            console.log("💡 PISTA: Si falla por RLS, necesitas usar la SUPABASE_SERVICE_ROLE_KEY en lugar de la ANON_KEY.");
        } else {
            console.log("✅ Perfil creado y promovido a SUPER_ADMIN exitosamente.");
        }
    }
}

repairProfile();

