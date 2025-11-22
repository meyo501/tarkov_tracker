/*
  # Tarkov Item Tracker Schema

  1. New Tables
    - `items`
      - `id` (uuid, primary key) - Unique identifier for each item
      - `name` (text) - Name of the item to track
      - `quantity_needed` (integer) - How many of this item are needed
      - `created_at` (timestamptz) - When the item was added
      - `user_id` (uuid) - Owner of the item (for future auth integration)
    
    - `found_items`
      - `id` (uuid, primary key) - Unique identifier for each found item record
      - `item_name` (text) - Name of the item that was found
      - `quantity` (integer) - How many were found at once
      - `found_at` (timestamptz) - When the item was marked as found
      - `user_id` (uuid) - Owner of the record (for future auth integration)

  2. Security
    - Enable RLS on both tables
    - Add permissive policies for now (can be restricted when auth is added)
    
  3. Important Notes
    - Using permissive policies initially to allow app functionality
    - Can be restricted to authenticated users later when auth is implemented
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity_needed integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

CREATE TABLE IF NOT EXISTS found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  found_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on items"
  ON items FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on found_items"
  ON found_items FOR ALL
  USING (true)
  WITH CHECK (true);