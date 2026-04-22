-- LYNCE SaaS Database Schema

-- Profiles table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    tier TEXT DEFAULT 'free', -- free, pro, agency
    role TEXT DEFAULT 'user', -- user, admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,  -- markdown
  author text DEFAULT 'LYNCE Team',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies for blog_posts
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, scanning, completed, failed
    score INTEGER DEFAULT 0,
    report_url TEXT, -- Path to PDF in storage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Findings table (Granular details for each scan)
CREATE TABLE IF NOT EXISTS public.findings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- SSL, Headers, Plugins, Core
    severity TEXT NOT NULL, -- critical, high, medium, low
    title TEXT NOT NULL,
    description TEXT,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    key_hash TEXT UNIQUE NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Enable RLS and basic policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Simple policies: Users only see their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view findings of own scans" ON public.findings FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.scans WHERE id = scan_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage own API keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);
