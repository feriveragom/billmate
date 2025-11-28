const { createClient } = require('@supabase/supabase-js');

// Necesitamos leer las variables de entorno directamente para este script de prueba
// NOTA: Asegúrate de tener un archivo .env.local con estas variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log("🔍 Iniciando diagnóstico de conexión Supabase...");
    console.log(`🌐 URL: ${SUPABASE_URL}`);
    
    const userId = '987e578c-a1dd-44cf-9d61-155b96152326'; // Tu ID fijo para probar
    
    const start = Date.now();
    
    try {
        console.log(`👤 Buscando perfil para ID: ${userId}...`);
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        const end = Date.now();
        const duration = end - start;
        
        if (error) {
            console.error(`❌ Error en la consulta (${duration}ms):`, error);
        } else {
            console.log(`✅ Éxito! Perfil encontrado en ${duration}ms`);
            console.log("📊 Datos:", data);
        }
        
    } catch (err) {
        console.error("💥 Excepción crítica:", err);
    }
}

testConnection();
