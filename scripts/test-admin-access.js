const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TARGET_EMAIL = 'feriveragom@gmail.com';

async function runDiagnostics() {
    console.log(`🏥 DIAGNÓSTICO DE ACCESO PARA: ${TARGET_EMAIL}\n`);

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("❌ Faltan variables de entorno básicas.");
        return;
    }

    // 1. PRUEBA CON CLAVE ANÓNIMA (Simula lo que hace tu App)
    // Nota: RLS suele impedir buscar por email directamente si no es tu propio usuario auth.
    // Por eso la app usa ID. Pero aquí intentaremos simular la carga.
    
    console.log("--- 1. Prueba de Latencia (Simulada) ---");
    // Para simular la app, necesitamos el ID real. Primero lo buscamos con admin.
    
    let realUserId = null;

    if (SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', TARGET_EMAIL).single();
        if (data) realUserId = data.id;
    }

    if (!realUserId) {
        console.log("⚠️ No se pudo obtener ID real para la prueba de latencia (Falta service key o usuario no existe).");
        return;
    }

    console.log(`🆔 ID Real confirmado: ${realUserId}`);
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // EJECUTAR 3 VECES
    for (let i = 1; i <= 3; i++) {
        process.stdout.write(`   Intento #${i}: `);
        const start = Date.now();
        try {
            const { data, error } = await supabaseAnon
                .from('profiles')
                .select('role')
                .eq('id', realUserId)
                .single();
            
            const time = Date.now() - start;
            
            if (error) {
                console.log(`❌ Fallo en ${time}ms - ${error.message} (${error.code})`);
            } else {
                console.log(`✅ Éxito en ${time}ms - Rol: ${data.role}`);
            }
        } catch (e) {
            console.log(`💥 Error de red: ${e.message}`);
        }
    }
}

runDiagnostics();
