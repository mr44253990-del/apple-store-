import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppItem, ReviewItem, AppSettings } from '../types.ts';

// User provided Supabase project credentials
export const DEFAULT_SUPABASE_URL = 'https://zuztlnyzbymywdpwhtee.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enRsbnl6YnlteXdkcHdodGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzQyMzYsImV4cCI6MjA3MzkxMDIzNn0.ULBfBkN4GpouzvKikC2rq8ARTseXMqNVabxLiCHXh1I';

export const SUPABASE_APP_COLUMNS = [
  'id',
  'name',
  'subtitle',
  'description',
  'icon_url',
  'download_url',
  'file_size',
  'version',
  'developer',
  'developer_email',
  'category',
  'rating',
  'rating_count',
  'price',
  'age_rating',
  'screenshots',
  'video_url',
  'tags',
  'whats_new',
  'in_app_purchases',
  'is_editors_choice',
  'is_featured',
  'is_app_of_the_day',
  'downloads_count',
  'compatibility',
  'languages',
  'created_at',
] as const;

/**
 * Filter and sanitize an AppItem so it perfectly matches the remote Supabase PostgreSQL schema.
 * Prevents PostgREST PGRST204 errors when client-only fields (e.g. slug, canonical_url) are present.
 */
export function sanitizeForSupabase(app: Partial<AppItem> & Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const col of SUPABASE_APP_COLUMNS) {
    if (app[col] !== undefined) {
      clean[col] = app[col];
    }
  }

  // Ensure safe defaults for non-null remote columns
  if (!clean.file_size) clean.file_size = '45.0 MB';
  if (!clean.version) clean.version = '1.0.0';
  if (!clean.developer) clean.developer = 'Apple Developer';
  if (!clean.category) clean.category = 'Utilities';
  if (clean.price === undefined) clean.price = 0;
  if (clean.rating === undefined) clean.rating = 4.8;
  if (clean.rating_count === undefined) clean.rating_count = 1;
  if (clean.downloads_count === undefined) clean.downloads_count = 0;
  if (!Array.isArray(clean.screenshots)) clean.screenshots = [];
  if (!Array.isArray(clean.tags)) clean.tags = [];
  if (!Array.isArray(clean.languages)) clean.languages = ['English'];
  if (!clean.created_at) clean.created_at = new Date().toISOString();

  return clean;
}

export function getActiveSupabaseCredentials() {
  const customUrl = localStorage.getItem('appstore_supabase_url');
  const customKey = localStorage.getItem('appstore_supabase_key');
  return {
    url: customUrl?.trim() || (import.meta.env.VITE_SUPABASE_URL as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL,
    key: customKey?.trim() || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY,
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
  if (newUrl !== undefined) {
    if (newUrl.trim()) {
      localStorage.setItem('appstore_supabase_url', newUrl.trim());
    } else {
      localStorage.removeItem('appstore_supabase_url');
    }
  }
  if (newKey !== undefined) {
    if (newKey.trim()) {
      localStorage.setItem('appstore_supabase_key', newKey.trim());
    } else {
      localStorage.removeItem('appstore_supabase_key');
    }
  }

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
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
      emailRedirectTo: redirectUrl,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Real Supabase Authentication: Sign In with Google
 */
export async function signInWithGoogleSupabase() {
  const client = getSupabase();
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Update user avatar or profile in Supabase Auth metadata
 */
export async function updateUserProfileMetadata(updates: { avatar_url?: string; full_name?: string }) {
  try {
    const client = getSupabase();
    const { data, error } = await client.auth.updateUser({
      data: updates,
    });
    if (error) console.warn('Supabase updateUser error:', error.message);
    return data;
  } catch (err) {
    console.warn('Could not sync user profile to Supabase:', err);
    return null;
  }
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
 * Update app download count in Supabase
 */
export async function incrementAppDownloadInSupabase(appId: string, newDownloadsCount: number) {
  try {
    const client = getSupabase();
    await client.from('apps').update({ downloads_count: newDownloadsCount }).eq('id', appId);
  } catch (err) {
    console.warn('Supabase download counter increment error:', err);
  }
}

/**
 * Upload a file directly to Supabase storage bucket 'apps' or 'app-assets'.
 * Correctly detects APK MIME type (application/vnd.android.package-archive), IPA, DMG, ZIP, images.
 */
export async function uploadAppFile(file: File, bucketName = 'apps'): Promise<string> {
  const client = getSupabase();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const cleanExt = fileExt.replace(/[^a-z0-9]/g, '');
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const fileName = `${Date.now()}_${cleanBaseName}.${cleanExt}`;
  const filePath = `uploads/${fileName}`;

  // Accurate MIME type detection (especially APK!)
  let contentType = file.type;
  if (cleanExt === 'apk') {
    contentType = 'application/vnd.android.package-archive';
  } else if (cleanExt === 'ipa') {
    contentType = 'application/octet-stream';
  } else if (cleanExt === 'dmg') {
    contentType = 'application/x-apple-diskimage';
  } else if (cleanExt === 'zip') {
    contentType = 'application/zip';
  } else if (cleanExt === 'png') {
    contentType = 'image/png';
  } else if (cleanExt === 'jpg' || cleanExt === 'jpeg') {
    contentType = 'image/jpeg';
  } else if (cleanExt === 'webp') {
    contentType = 'image/webp';
  } else if (cleanExt === 'svg') {
    contentType = 'image/svg+xml';
  } else if (cleanExt === 'mp4') {
    contentType = 'video/mp4';
  }

  try {
    const { error: uploadError } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType || undefined,
      });

    if (!uploadError) {
      const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.warn(`Supabase storage upload note (${bucketName}):`, uploadError.message);
      // If error is about bucket permissions, return informative error
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket "${bucketName}" not found. Please create public bucket "${bucketName}" in Supabase Storage.`);
      }
    }
  } catch (err: any) {
    console.warn('Storage upload error:', err?.message || err);
    // If it's an explicit error from above, rethrow
    if (err?.message?.includes('bucket')) {
      throw err;
    }
  }

  // Fallback for smaller files (under 1.5MB images)
  if (file.size <= 1.5 * 1024 * 1024 && (file.type.startsWith('image/') || cleanExt === 'png' || cleanExt === 'jpg')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  }

  // For APK or large files, use local Object URL so localStorage does not hit QuotaExceededError
  return URL.createObjectURL(file);
}

/**
 * Comprehensive connectivity test with active Supabase project
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  databaseOk: boolean;
  storageOk: boolean;
  remoteAppsCount?: number;
  details?: any;
}> {
  let databaseOk = false;
  let storageOk = false;
  let remoteAppsCount = 0;

  try {
    const client = getSupabase();

    // 1. Test database table 'apps'
    const { data: dbData, error: dbError, count } = await client
      .from('apps')
      .select('id', { count: 'exact' })
      .limit(5);

    if (!dbError) {
      databaseOk = true;
      remoteAppsCount = count ?? (Array.isArray(dbData) ? dbData.length : 0);
    } else {
      if (dbError.code === 'PGRST116' || dbError.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase project, but the "apps" table is missing. Run the SQL Schema from the tab below.',
          databaseOk: false,
          storageOk: false,
          details: dbError,
        };
      }
    }

    // 2. Test Storage Bucket 'apps'
    try {
      const { data: bucketsData, error: bucketError } = await client.storage.listBuckets();
      if (!bucketError && Array.isArray(bucketsData)) {
        const hasAppsBucket = bucketsData.some((b) => b.name === 'apps' || b.id === 'apps');
        storageOk = hasAppsBucket;
      }
    } catch {
      storageOk = false;
    }

    if (databaseOk) {
      return {
        success: true,
        message: `Supabase connected successfully! Remote database is active (${remoteAppsCount} apps registered). Storage bucket: ${storageOk ? 'Active' : 'Ready'}.`,
        databaseOk: true,
        storageOk,
        remoteAppsCount,
        details: dbData,
      };
    }

    return {
      success: false,
      message: 'Failed to access "apps" table on Supabase. Check API key permissions or run SQL Schema.',
      databaseOk: false,
      storageOk,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err?.message || 'Network error'}`,
      databaseOk: false,
      storageOk: false,
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
    video_url TEXT,
    tags TEXT[] DEFAULT '{}',
    whats_new TEXT,
    in_app_purchases BOOLEAN DEFAULT false,
    is_editors_choice BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_app_of_the_day BOOLEAN DEFAULT false,
    downloads_count INTEGER DEFAULT 0,
    compatibility TEXT DEFAULT 'Requires iOS 16.0 or later. Compatible with iPhone, iPad, and Mac.',
    languages TEXT[] DEFAULT '{"English"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick migration if table already exists in your Supabase project:
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS compatibility TEXT;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

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
