import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Room } from '../lib/types';
import { useRouter } from 'next/router';

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
    
    // Subscribe to room changes
    const subscription = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        fetchRooms
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createRoom() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{}])
        .select()
        .single();

      if (error) throw error;

      // Add creator as room member
      await supabase.from('room_members').insert({
        room_id: data.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      router.push(`/room/${data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  }

  async function joinRoom(roomId: string) {
    try {
      const { error } = await supabase
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  if (loading) {
    return <div>Loading rooms...</div>;
  }

  return (
    <div className="room-manager">
      <div className="room-header">
        <h2>Available Rooms</h2>
        <button onClick={createRoom} className="create-room-btn">
          Create New Room
        </button>
      </div>

      <div className="room-list">
        {rooms.map((room) => (
          <div key={room.id} className="room-item">
            <span>Room: {room.id.slice(0, 8)}...</span>
            <span>Created: {new Date(room.created_at).toLocaleString()}</span>
            <button onClick={() => joinRoom(room.id)}>Join Room</button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .room-manager {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .create-room-btn {
          background: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }

        .room-list {
          display: grid;
          gap: 10px;
        }

        .room-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 5px;
        }

        .room-item button {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
} 