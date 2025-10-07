/*
  # Add Tester Codes System

  ## Overview
  This migration adds support for special tester access codes that grant free access to the platform.

  ## 1. New Tables

  ### `tester_codes`
  - `id` (uuid, primary key) - Unique identifier for the code
  - `code` (text, unique) - The actual access code (e.g., "BETATESTER2025")
  - `description` (text) - Description of what this code is for
  - `max_uses` (integer, nullable) - Maximum number of times this code can be used (null = unlimited)
  - `current_uses` (integer) - Current number of times this code has been used
  - `is_active` (boolean) - Whether this code is currently active
  - `expires_at` (timestamptz, nullable) - When this code expires (null = no expiration)
  - `created_at` (timestamptz) - When the code was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `user_tester_codes`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to profiles.id
  - `code` (text) - The code that was used
  - `redeemed_at` (timestamptz) - When the code was redeemed
  - Composite unique constraint on (user_id, code) - Prevents duplicate redemptions

  ## 2. Security (RLS Policies)

  ### tester_codes table:
  - Public read access for active, non-expired codes (to validate codes during signup)
  - No write access for users (admin-only via service role)

  ### user_tester_codes table:
  - Users can view their own redeemed codes
  - Users can create redemption records (during signup/upgrade flow)

  ## 3. Important Notes
  - Tester codes provide lifetime free access
  - Codes can be limited by usage count or expiration date
  - Users with redeemed tester codes get "tester" subscription_tier in profiles
  - All tables have RLS enabled by default
*/

-- Create tester_codes table
CREATE TABLE IF NOT EXISTS tester_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_tester_codes table
CREATE TABLE IF NOT EXISTS user_tester_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tester_codes_code_idx ON tester_codes(code);
CREATE INDEX IF NOT EXISTS user_tester_codes_user_id_idx ON user_tester_codes(user_id);

-- Enable RLS
ALTER TABLE tester_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tester_codes ENABLE ROW LEVEL SECURITY;

-- Tester Codes RLS Policies (read-only for public to validate codes)
CREATE POLICY "Anyone can view active tester codes"
  ON tester_codes FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- User Tester Codes RLS Policies
CREATE POLICY "Users can view own redeemed codes"
  ON user_tester_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem tester codes"
  ON user_tester_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger to tester_codes
DROP TRIGGER IF EXISTS update_tester_codes_updated_at ON tester_codes;
CREATE TRIGGER update_tester_codes_updated_at
  BEFORE UPDATE ON tester_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default tester codes
INSERT INTO tester_codes (code, description, max_uses) VALUES
  ('BETATESTER2025', 'Beta tester access for 2025', NULL),
  ('FRIENDSANDFAMILY', 'Friends and family access code', 50),
  ('EARLYACCESS', 'Early access code', 100)
ON CONFLICT (code) DO NOTHING;
