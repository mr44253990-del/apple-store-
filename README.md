# 🍎 Apple App Store - Supabase & Admin Configuration Guide (README)

এই ডকুমেন্টে আপনার অ্যাপল অ্যাপ স্টোর ক্লোনের জন্য **Supabase**, **Real Login (প্রকৃত লগইন)**, **Admin Access**, **Storage** এবং **Google Search Console** সঠিকভাবে কনফিগার করার সম্পূর্ণ নিয়মাবলী দেওয়া হলো।

---

## ১. Supabase প্রজেক্ট ক্রেডেনশিয়াল (Project Credentials)

আপনার প্রজেক্টের সাথে ইতিমধ্যে নিম্নলিখিত Supabase কনফিগারেশন যুক্ত করা রয়েছে:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zuztlnyzbymywdpwhtee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enRsbnl6YnlteXdkcHdodGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzQyMzYsImV4cCI6MjA3MzkxMDIzNn0.ULBfBkN4GpouzvKikC2rq8ARTseXMqNVabxLiCHXh1I
```

---

## ২. রিয়েল লগইন এবং অ্যাডমিন অ্যাকাউন্ট সেটআপ (Real Login & Admin Setup)

### অ্যাডমিন ইমেইল:
**`mr4425390@gmail.com`**

এই ইমেইল দিয়ে লগইন করলে স্বয়ংক্রিয়ভাবে **App Store Connect Admin Panel** আনলক হবে।

### Supabase-এ ইউজার তৈরির ২টি পদ্ধতি:

#### পদ্ধতি ১: অ্যাপ থেকে সরাসরি তৈরি (Sign Up from App)
1. অ্যাপের উপরের ডানপাশের **Sign In** বাটনে ক্লিক করুন।
2. **"Don't have an Apple ID? Create one now"** বাটনে ক্লিক করুন।
3. আপনার ইমেইল (যেমন: `mr4425390@gmail.com`), নাম এবং পাসওয়ার্ড দিন।
4. **Create Account** বাটনে ক্লিক করুন।

#### পদ্ধতি ২: Supabase Dashboard থেকে তৈরি (Supabase Dashboard)
1. আপনার Supabase ড্যাশবোর্ডে প্রবেশ করুন:  
   👉 [https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/auth/users](https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/auth/users)
2. **Add User** -> **Create User** বাটনে ক্লিক করুন।
3. Email দিন: `mr4425390@gmail.com`
4. Password দিন এবং **Auto Confirm User?** অন (Checked) রাখুন।
5. Save করুন।

> 💡 **গুরুত্বপূর্ণ টিপ (Email Confirm Disable):**  
> Supabase Dashboard-এ যান: **Authentication** -> **Providers** -> **Email** -> **"Confirm email"** অপশনটি OFF করে দিন। এতে ব্যবহারকারী রেজিস্ট্রেশন করার সাথে সাথেই কোনো ইমেইল ভেরিফিকেশন ছাড়া সরাসরি লগইন করতে পারবে।

---

## ৩. Supabase ডাটাবেস টেবিল তৈরি (SQL Database Setup)

Supabase ড্যাশবোর্ডের **SQL Editor**-এ যান:  
👉 [https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/sql](https://supabase.com/dashboard/project/zuztlnyzbymywdpwhtee/sql)

নিচের কোডটুকু হুবহু কপি করে রান (RUN) করুন:

```sql
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

-- 4. Enable Row Level Security (RLS)
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

-- 5. Storage Buckets (apps এবং app-assets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apps', 'apps', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Objects" ON storage.objects FOR ALL USING (bucket_id IN ('apps', 'app-assets'));
```

---

## ৪. Supabase Storage (ফাইল আপলোড ও সরাসরি ডাউনলোড)

1. Supabase Dashboard-এর **Storage** মেনুতে যান।
2. যদি `apps` নামের বাকেট না থাকে, **New Bucket** বাটনে ক্লিক করে নাম দিন `apps` এবং **Public bucket** অন করে দিন।
3. আইকন আপলোডের জন্য আরেকটি বাকেট তৈরি করতে পারেন যার নাম `app-assets` (Public bucket on)।
4. এখন অ্যাডমিন প্যানেল থেকে আপনি যেকোনো অ্যাপ্লিকেশন ফাইল (.apk, .ipa, .zip, .dmg, ইত্যাদি) আপলোড করলে তা সরাসরি Supabase স্টোরেজে জমা হবে এবং গ্রাহকরা **GET** বাটনে ক্লিক করলেই সরাসরি ডাউনলোড শুরু হবে।

---

## ৫. গুগল সার্চ কনসোল ও অটো ইনডেক্সিং (Google Search Console & Auto Indexing)

1. [Google Search Console](https://search.google.com/search-console)-এ আপনার সাইটের ডোমেইন বা URL যুক্ত করুন।
2. **HTML Tag** ভেরিফিকেশন নির্বাচন করুন এবং মেটা ট্যাগের কোডটি কপি করুন (যেমন: `google-site-verification=abc123...`)।
3. আমাদের অ্যাপের **Admin Panel** -> **Google Search Console & SEO** ট্যাবে যান।
4. কোডটি পেস্ট করে সেভ করুন।
5. আপনার অ্যাপের `<head>`-এ এই মেটা ট্যাগ স্বয়ংক্রিয়ভাবে বসে যাবে এবং Schema.org JSON-LD-এর সাহায্যে গুগল বট আপনার সব অ্যাপস ক্রল ও ইনডেক্স করবে।

---

## ৬. অটো হ্যাশট্যাগ ও ফেক রিভিউ জেনারেটর (Auto Tags & Reviews)

- **Auto # Tags Generator**: অ্যাডমিন প্যানেলে অ্যাপের নাম ও ক্যাটাগরি লিখে **Generate # Tags Now** বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে সেরা র‍্যাঙ্কিং হ্যাশট্যাগগুলো তৈরি হয়ে যাবে।
- **Fake Reviews**: নতুন অ্যাপ যুক্ত করার সময় **Auto Fake Reviews Generator** চেকমার্ক অন রাখলে সাথে সাথে ৩-৫টি ভেরিফায়েড অ্যাপল রিভিউ ও স্টার রেটিং অ্যাপের পেজে যোগ হবে।
