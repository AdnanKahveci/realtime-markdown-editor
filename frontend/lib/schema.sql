-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Create room_members table
CREATE TABLE room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Enable RLS on room_members
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- Create cursors table
CREATE TABLE cursors (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  position JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, room_id)
);

-- Enable RLS on cursors
ALTER TABLE cursors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Room visibility policy
CREATE POLICY "Room visibility" ON rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_id = rooms.id AND user_id = auth.uid()
    )
  );

-- Room member visibility policy
CREATE POLICY "Room member visibility" ON room_members
  FOR SELECT
  USING (room_id IN (
    SELECT room_id FROM room_members WHERE user_id = auth.uid()
  ));

-- Cursor visibility policy
CREATE POLICY "Cursor visibility" ON cursors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_id = cursors.room_id AND user_id = auth.uid()
    )
  );

-- Cursor update policy
CREATE POLICY "Cursor update" ON cursors
  FOR UPDATE
  USING (user_id = auth.uid());

-- Cursor insert policy
CREATE POLICY "Cursor insert" ON cursors
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to update cursor timestamp
CREATE OR REPLACE FUNCTION update_cursor_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cursor timestamp
CREATE TRIGGER update_cursor_timestamp
  BEFORE UPDATE ON cursors
  FOR EACH ROW
  EXECUTE FUNCTION update_cursor_timestamp(); 