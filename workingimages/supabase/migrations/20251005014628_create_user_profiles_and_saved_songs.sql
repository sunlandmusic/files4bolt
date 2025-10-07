/*
  # Piano XL User System - Initial Schema

  ## Overview
  This migration sets up the complete user management and song storage system for Piano XL.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User's email address
  - `subscription_status` (text) - Values: 'free', 'active', 'cancelled', 'expired'
  - `subscription_tier` (text) - Values: 'free', 'monthly', 'yearly'
  - `stripe_customer_id` (text, nullable) - Stripe customer reference
  - `subscription_expires_at` (timestamptz, nullable) - When subscription ends
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `saved_songs`
  - `id` (uuid, primary key) - Unique song identifier
  - `user_id` (uuid, foreign key) - Links to profiles.id
  - `title` (text) - Song/progression title
  - `chord_data` (jsonb) - Complete chord progression data
  - `settings` (jsonb) - User's Piano XL settings (skin, tempo, etc)
  - `created_at` (timestamptz) - When song was saved
  - `updated_at` (timestamptz) - Last modification

  ## 2. Security (RLS Policies)
  
  ### profiles table:
  - Users can read their own profile
  - Users can update their own profile
  - New profiles created automatically on signup via trigger

  ### saved_songs table:
  - Users can read only their own saved songs
  - Users can create new saved songs
  - Users can update only their own saved songs
  - Users can delete only their own saved songs

  ## 3. Important Notes
  - All tables have RLS enabled by default
  - Profiles are auto-created when users sign up via trigger
  - All user data is isolated per user_id
  - JSONB fields allow flexible storage of chord and settings data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_status text NOT NULL DEFAULT 'free',
  subscription_tier text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_songs table
CREATE TABLE IF NOT EXISTS saved_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  chord_data jsonb NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS saved_songs_user_id_idx ON saved_songs(user_id);
CREATE INDEX IF NOT EXISTS saved_songs_created_at_idx ON saved_songs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_songs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Saved Songs RLS Policies
CREATE POLICY "Users can view own saved songs"
  ON saved_songs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved songs"
  ON saved_songs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved songs"
  ON saved_songs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved songs"
  ON saved_songs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_songs_updated_at ON saved_songs;
CREATE TRIGGER update_saved_songs_updated_at
  BEFORE UPDATE ON saved_songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
