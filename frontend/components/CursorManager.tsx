import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CursorPosition, CursorData } from '../lib/types';
import { debounce, generateUserColor, getGuestId } from '../lib/utils';

interface CursorManagerProps {
  roomId: string;
  editor: any; // CodeMirror editor instance
}

export default function CursorManager({ roomId, editor }: CursorManagerProps) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const userId = useRef(getGuestId());
  const cursorColor = useRef(generateUserColor(userId.current));

  useEffect(() => {
    if (!editor || !roomId) return;

    // Subscribe to cursor changes
    const subscription = supabase
      .channel('room-cursors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cursors',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          const cursorData = payload.new as CursorData;
          if (cursorData.userId === userId.current) return;

          setCursors((prev) => {
            const next = new Map(prev);
            if (payload.eventType === 'DELETE') {
              next.delete(cursorData.userId);
            } else {
              next.set(cursorData.userId, cursorData);
            }
            return next;
          });
        }
      )
      .subscribe();

    // Update cursor position
    const updateCursorPosition = async (position: CursorPosition) => {
      try {
        await supabase
          .from('cursors')
          .upsert({
            user_id: userId.current,
            room_id: roomId,
            position: position,
            color: cursorColor.current,
          })
          .eq('user_id', userId.current)
          .eq('room_id', roomId);
      } catch (error) {
        console.error('Error updating cursor position:', error);
      }
    };

    // Debounced cursor update
    const debouncedUpdate = debounce(updateCursorPosition, 200);

    // Listen to cursor activity
    const cursorActivity = editor.on('cursorActivity', () => {
      const pos = editor.getCursor();
      debouncedUpdate({
        line: pos.line,
        ch: pos.ch,
      });
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
      editor.off('cursorActivity', cursorActivity);
    };
  }, [editor, roomId]);

  // Render cursors
  useEffect(() => {
    if (!editor) return;

    // Clear existing cursor markers
    editor.getAllMarks().forEach((mark: any) => {
      if (mark.className?.includes('remote-cursor')) {
        mark.clear();
      }
    });

    // Render remote cursors
    cursors.forEach((cursor, remoteUserId) => {
      if (remoteUserId === userId.current) return;

      const pos = cursor.position;
      const cursorElement = document.createElement('span');
      cursorElement.className = 'remote-cursor';
      cursorElement.style.borderLeftColor = cursor.color;
      
      editor.setBookmark(
        { line: pos.line, ch: pos.ch },
        { widget: cursorElement, insertLeft: true }
      );
    });
  }, [cursors, editor]);

  return null;
} 