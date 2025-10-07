/*
  # Sync Subscription Status to Profiles

  ## Overview
  This migration creates a system to automatically sync Stripe subscription status to user profiles,
  and handles subscription expiration by checking the current_period_end timestamp.

  ## 1. Function: update_profile_subscription_status

  This function syncs the Stripe subscription status to the profiles table.
  It's triggered whenever stripe_subscriptions changes.

  ### Logic:
  - If subscription status is 'active' or 'trialing' → set profile to 'active'
  - If subscription has expired (current_period_end < now) → set profile to 'expired'
  - If subscription is 'past_due', 'canceled', 'unpaid' → set profile to appropriate status
  - Tester accounts are never affected (subscription_tier = 'tester')

  ## 2. Trigger

  Automatically updates profile when subscription status changes in stripe_subscriptions table.

  ## 3. Manual Sync Function

  A function to check all subscriptions and update expired ones.
  This can be called periodically to ensure profiles reflect current subscription state.

  ## 4. Important Notes

  - Access is automatically locked when subscription_status is not 'active' (unless tester)
  - The app already checks subscription_status in profiles table
  - Webhook updates stripe_subscriptions, which triggers profile update
  - Users with expired subscriptions must resubscribe to regain access
*/

-- Function to sync subscription status from Stripe to profiles
CREATE OR REPLACE FUNCTION sync_subscription_status_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid uuid;
  profile_tier text;
BEGIN
  -- Get the user_id from stripe_customers
  SELECT user_id INTO user_uuid
  FROM stripe_customers
  WHERE customer_id = NEW.customer_id
  AND deleted_at IS NULL;

  IF user_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get the user's subscription tier
  SELECT subscription_tier INTO profile_tier
  FROM profiles
  WHERE id = user_uuid;

  -- Don't update tester accounts
  IF profile_tier = 'tester' THEN
    RETURN NEW;
  END IF;

  -- Update profile based on subscription status
  IF NEW.status IN ('active', 'trialing') THEN
    -- Check if subscription is actually still valid (not expired)
    IF NEW.current_period_end IS NOT NULL AND 
       to_timestamp(NEW.current_period_end) < now() THEN
      -- Subscription period has ended
      UPDATE profiles
      SET 
        subscription_status = 'expired',
        updated_at = now()
      WHERE id = user_uuid;
    ELSE
      -- Subscription is active
      UPDATE profiles
      SET 
        subscription_status = 'active',
        subscription_tier = 'paid',
        updated_at = now()
      WHERE id = user_uuid;
    END IF;
  ELSIF NEW.status IN ('past_due') THEN
    UPDATE profiles
    SET 
      subscription_status = 'past_due',
      updated_at = now()
    WHERE id = user_uuid;
  ELSIF NEW.status IN ('canceled', 'unpaid', 'incomplete_expired') THEN
    UPDATE profiles
    SET 
      subscription_status = 'cancelled',
      updated_at = now()
    WHERE id = user_uuid;
  ELSIF NEW.status = 'incomplete' THEN
    UPDATE profiles
    SET 
      subscription_status = 'free',
      updated_at = now()
    WHERE id = user_uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically sync when subscription changes
DROP TRIGGER IF EXISTS sync_subscription_to_profile_trigger ON stripe_subscriptions;
CREATE TRIGGER sync_subscription_to_profile_trigger
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_status_to_profile();

-- Function to manually check and update expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update profiles where subscription has expired
  UPDATE profiles p
  SET 
    subscription_status = 'expired',
    updated_at = now()
  FROM stripe_customers sc
  JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
  WHERE 
    p.id = sc.user_id
    AND p.subscription_tier != 'tester'
    AND ss.status IN ('active', 'trialing')
    AND ss.current_period_end IS NOT NULL
    AND to_timestamp(ss.current_period_end) < now()
    AND p.subscription_status = 'active'
    AND sc.deleted_at IS NULL
    AND ss.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run initial sync for existing subscriptions
SELECT sync_subscription_status_to_profile() 
FROM stripe_subscriptions 
WHERE deleted_at IS NULL;

-- Check for any expired subscriptions
SELECT check_expired_subscriptions();
