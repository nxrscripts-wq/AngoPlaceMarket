import { createClient } from '@supabase/supabase-js';
import type { Product, ProductStatus } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://khkowyfqhgetntwnxgbq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoa293eWZxaGdldG50d254Z2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDYwNTEsImV4cCI6MjA4NDU4MjA1MX0.yCmMxmt2uyMtGNJfYwcnGJVwrzTQFM04rM0PNdSgjqc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { Product, ProductStatus };
