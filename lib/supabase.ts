// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://biyyduixzedjnxmblrff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpeXlkdWl4emVkam54bWJscmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzAzMzk0NywiZXhwIjoyMDYyNjA5OTQ3fQ.ErVwdsL5qy2fbm3qOtwdF4bbpBWgxq4Ald1YZ2CG3J4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
