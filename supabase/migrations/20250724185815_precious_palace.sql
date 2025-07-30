/*
  # Create waitlist table with welcome email tracking

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamp with timezone, default now())
      - `welcome_email_sent` (boolean, default false)

  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for anonymous users to insert (signup)
    - Add policy for authenticated users to read waitlist data
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  welcome_email_sent boolean DEFAULT false
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to sign up for waitlist
CREATE POLICY "Allow anonymous waitlist signup"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read waitlist
CREATE POLICY "Authenticated users can read waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);