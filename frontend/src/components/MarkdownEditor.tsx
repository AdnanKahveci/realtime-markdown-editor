'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorView } from '@codemirror/view';
import { v4 as uuidv4 } from 'uuid';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface CursorPosition {
  line: number;
  ch: number;
}

interface EditorProps {
  initialValue?: string;
  roomId?: string;
}

export default function MarkdownEditor({ initialValue = '', roomId = uuidv4() }: EditorProps) {
  const [value, setValue] = useState<string>(initialValue);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ line: 0, ch: 0 });

  // Editör değişikliklerini işle
  const handleChange = (newValue: string = '') => {
    setValue(newValue);
    // TODO: Değişiklikleri sunucuya gönder
  };

  // İmleç pozisyonunu takip et
  const handleCursorChange = (editor: EditorView) => {
    const pos = editor.state.selection.main.head;
    const line = editor.state.doc.lineAt(pos);
    setCursorPosition({
      line: line.number - 1,
      ch: pos - line.from
    });
    // TODO: İmleç pozisyonunu sunucuya gönder
  };

  useEffect(() => {
    // TODO: Supabase Realtime bağlantısı
    return () => {
      // TODO: Bağlantıyı temizle
    };
  }, [roomId]);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Realtime Markdown Editor</h1>
          <div className="relative">
            <MDEditor
              value={value}
              onChange={handleChange}
              preview="edit"
              height={500}
            />
            {/* TODO: Diğer kullanıcıların imleçlerini göster */}
          </div>
        </div>
      </div>
    </div>
  );
} 