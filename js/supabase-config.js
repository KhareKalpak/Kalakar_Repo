// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

const SUPABASE_URL = 'https://ujzgvcvxcvkagbbcdvtl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqemd2Y3Z4Y3ZrYWdiYmNkdnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTYyNDUsImV4cCI6MjA3NzQ3MjI0NX0.BSIQhH_HOzZXM5EVB2ryoYxGSEcTXBaCFycUeYMFvZc';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase initialized successfully!');
