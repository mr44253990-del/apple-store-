import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppItem, ReviewItem, AppSettings } from '../types.ts';

// User provided Supabase project credentials
export const DEFAULT_SUPABASE_URL = 'https://zuztlnyzbymywdpwhtee.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enRsbnl6YnlteXdkcHdodGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzQyMzYsImV4cCI6MjA3MzkxMDIzNn0.ULBfBkN4GpouzvKikC2rq8ARTseXMqNVabxLiCHXh1I';

export function getActiveSupabaseCredentials() {
  const customUrl = localStorage.getItem('appstore_supabase_url');
  const customKey = localStorage.getItem('appstore_supabase_key');
  return {
    url: customUrl || (import.meta.env.VITE_SUPABASE_URL as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL,
    key: customKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const { url, key } = getActiveSupabaseCredentials();
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export function resetSupabaseClient(newUrl?: string, newKey?: string) {
  if (newUrl) localStorage.setItem('appstore_supabase_url', newUrl);
  if (newKey) localStorage.setItem('appstore_supabase_key', newKey);
  const { url, key } = getActiveSupabaseCredentials();
  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return supabaseInstance;
}

/**
 * Real Supabase Authentication: Sign In
 */
export async function signInWithSupabase(email: string, password: string) {
  const client = getSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Real Supabase Authentication: Sign Up
 */
export async function signUpWithSupabase(email: string, password: string, fullName?: string) {
  const client = getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Real Supabase Authentication: Sign Out
 */
export async function signOutFromSupabase() {
  const client = getSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

/**
 * Upload a file directly to Supabase storage bucket 'apps' or 'app-assets'.
 * If the bucket doesn't exist or permissions prevent upload, returns data URL fallback.
 */
export async function uploadAppFile(file: File, bucketName = 'apps'): Promise<string> {
  const client = getSupabase();
  const fileExt = file.name.split('.').pop() || 'bin';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  try {
    const { error: uploadError } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError) {
      const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.warn('Supabase storage upload note:', uploadError.message);
    }
  } catch (err) {
    console.warn('Storage upload error, using local data URL fallback:', err);
  }

  // Fallback: Read as ObjectURL or DataURL for instant local preview/download
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const client = getSupabase();
    // Test auth ping
    const { data: authData, error: authError } = await client.auth.getSession();
    
    // Test apps table
    const { data, error } = await client.from('apps').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase Project! The "apps" table is not yet created in your database. Please copy and execute the SQL Schema from the tab below.',
          details: error,
        };
      }
      return {
        success: false,
        message: `Supabase returned: ${error.message} (code: ${error.code})`,
        details: error,
      };
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase! Remote "apps" database table is active and responsive.',
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect: ${err?.message || 'Network error'}`,
      details: err,
    };
  }
}

/**
 * SQL Schema for Supabase SQL Editor
 */
export function getSupabaseSchemaSQL(): string {
  return `-- Copy and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/sql)

-- 1. Create 'apps' table
CREATE TABLE IF NOT EXISTS public.apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon_url TEXT,
    download_url TEXT NOT NULL,
    file_size TEXT DEFAULT '45.0 MB',
    version TEXT DEFAULT '1.0.0',
    developer TEXT DEFAULT 'Apple Developer',
    developer_email TEXT,
    category TEXT DEFAULT 'Utilities',
    rating NUMERIC DEFAULT 4.8,
    rating_count INTEGER DEFAULT 120,
    price NUMERIC DEFAULT 0,
    age_rating TEXT DEFAULT '4+',
    screenshots TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    whats_new TEXT,
    in_app_purchases BOOLEAN DEFAULT false,
    is_editors_choice BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_app_of_the_day BOOLEAN DEFAULT false,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create 'reviews' table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES public.apps(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    date TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create 'settings' table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'app_store_settings',
    google_search_console_token TEXT,
    auto_google_index BOOLEAN DEFAULT true,
    site_title TEXT,
    site_description TEXT,
    accent_color TEXT DEFAULT 'blue',
    theme_mode TEXT DEFAULT 'system',
    custom_download_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable public read/write access (Row Level Security)
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Apps" ON public.apps FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Apps" ON public.apps FOR ALL USING (true);
CREATE POLICY "Public Delete Apps" ON public.apps FOR DELETE USING (true);

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR ALL USING (true);

CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Update Settings" ON public.settings FOR ALL USING (true);

-- 5. Storage bucket setup (for direct file and icon uploads)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apps', 'apps', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Access" ON storage.objects FOR ALL USING (bucket_id IN ('apps', 'app-assets'));
`;
}
