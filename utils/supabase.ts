import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://192.168.1.105:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

export const supabase = createClient(supabaseUrl, supabaseKey);
