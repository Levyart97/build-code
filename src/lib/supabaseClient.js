import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zygzkcpaxgmkybwcckjf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5Z3prY3BheGdta3lid2Nja2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1OTYyMjMsImV4cCI6MjA2NDE3MjIyM30.qitM0JuSXlR7oVY0cyJ0m7o5tgOINXkXOPjcAKxsIW0";

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;