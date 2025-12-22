import { createClient } from '@supabase/supabase-js';

// Возьми эти данные в Supabase -> Settings -> API
const supabaseUrl = 'https://nneccwuagyietimdqmoa.supabase.co'; // Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZWNjd3VhZ3lpZXRpbWRxbW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzExNjQsImV4cCI6MjA4MTEwNzE2NH0.uPrGg6LoJgSff6WLFfRGCdYZBTXUPssqAPjyXW8FzwY'; // Project API keys -> anon public

export const supabase = createClient(supabaseUrl, supabaseKey);
