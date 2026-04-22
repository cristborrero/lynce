-- Create an enum for user tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'agency');

-- Create a table for public profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  tier subscription_tier DEFAULT 'free'::subscription_tier,
  free_scans_used INT DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  api_key TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT 
USING ( true );

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Create a trigger function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table for tracking individual scans for billing/history purposes
CREATE TABLE public.scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  score INT,
  status TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" 
ON public.scan_history FOR SELECT 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own scans"
ON public.scan_history FOR INSERT
WITH CHECK ( auth.uid() = user_id );
