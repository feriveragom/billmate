
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log("Checking profiles schema...");
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Columns available:", Object.keys(data[0]));
    } else {
        console.log("No profiles found to infer schema, but connection works.");
    }
}

checkSchema();

