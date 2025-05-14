// components/ChatInput.tsx
import React, { useState } from 'react';
import { Button } from '@/components/button';
import { SendIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: (text: string) => void;
}

export default function ChatInput({ onSendMessage, onTyping }:ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping?.(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-neutral2-5 rounded-b-[20px]">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded-[20px] bg-neutral2-3 text-gray-100 placeholder-gray-400
          border border-neutral2-20 focus:border-wine focus:ring-2 focus:ring-wine/50
          shadow-neumorphic-dark-inset"
      />
      <Button
        onClick={handleSend}
        className="px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white rounded-full
          shadow-card hover:shadow-wrapper"
        child={<SendIcon />}
      />
    </div>
  );
};