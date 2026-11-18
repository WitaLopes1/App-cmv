import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xsxpqwfzgtgxmarnibwq.supabase.co';
const supabaseKey = 'sb_publishable_Jf7vImQ6f9OB76XQ5PbNIA_3bh0sDfi';

export const supabase = createClient(supabaseUrl, supabaseKey);
