const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://scjipuhdlilqyrvcecji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjamlwdWhkbGlscXlydmNlY2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNzYyOTIsImV4cCI6MjAzMDc1MjI5Mn0.8eCubG5Y6dTJXcfVjTASHrfVJjUueroqBDOfc8HX5dg';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
