/*
  # Add Tester Expiration to Profiles

  ## Overview
  Updates the tester code system so users get 1 month of access from the day they redeem a code.

  ## 1. Schema Changes

  ### profiles table:
  - Add `tester_expires_at` (timestamptz, nullable) - When tester access expires

  ## 2. Logic

  When a user redeems a tester code:
  - `subscription_status` = 'active'
  - `subscription_tier` = 'tester'
  - `tester_expires_at` = now() + 1 month

  ## 3. Access Control

  Access is granted if:
  - (subscription_status = 'active' AND subscription_tier = 'paid') OR
  - (subscription_tier = 'tester' AND tester_expires_at > now()) OR
  - (subscription_tier = 'tester' AND tester_expires_at IS NULL) -- legacy unlimited access

  ## 4. Function to Check Expired Testers

  Function to automatically expire tester accounts that have passed their expiration date.

  ## 5. Important Notes

  - Tester codes themselves never expire (can always be redeemed)
  - Each redemption gives the user 1 month of access
  - Users must sign up again with a new code after expiration (if available)
  - Existing tester accounts without expiration remain unlimited (backward compatible)
*/

-- Add tester_expires_at column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tester_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tester_expires_at timestamptz;
  END IF;
END $$;

-- Function to check and expire tester accounts
CREATE OR REPLACE FUNCTION check_expired_tester_accounts()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    subscription_status = 'expired',
    updated_at = now()
  WHERE 
    subscription_tier = 'tester'
    AND tester_expires_at IS NOT NULL
    AND tester_expires_at < now()
    AND subscription_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run initial check
SELECT check_expired_tester_accounts();
