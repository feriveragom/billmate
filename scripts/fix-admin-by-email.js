const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Usamos la variable de entorno, que se pasará al ejecutar
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error("❌ Se requiere SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fixAdminByEmail() {
    const email = 'feriveragom@gmail.com';
    console.log(`🔍 Buscando usuario por email: ${email}...`);

    // 1. Buscar en la tabla PROFILES por email (si existe columna email)
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error || !profiles || profiles.length === 0) {
        console.log("⚠️ No encontrado en 'profiles' por email. Buscando ID en Auth...");
        // Aquí necesitaríamos acceso a auth.users, que el cliente JS no da directo tan fácil.
        // Pero asumamos que si no está en profiles, hay que crearlo.
        console.log("❌ No se pudo encontrar el perfil para promoverlo.");
        return;
    }

    const user = profiles[0];
    console.log(`✅ Usuario encontrado! ID: ${user.id} (Rol actual: ${user.role})`);

    if (user.role === 'SUPER_ADMIN') {
        console.log("🎉 El usuario YA es SUPER_ADMIN. Todo correcto.");
    } else {
        console.log("🔄 Promoviendo a SUPER_ADMIN...");
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'SUPER_ADMIN' })
            .eq('id', user.id);
            
        if (updateError) console.error("❌ Error actualizando:", updateError);
        else console.log("✨ Éxito! Usuario promovido.");
    }
}

fixAdminByEmail();

