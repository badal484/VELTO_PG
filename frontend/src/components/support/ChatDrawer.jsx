import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function ChatDrawer({ chatId, onClose }) {
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const socket = useSocket();

  const fetchChat = useCallback(async () => {
    try {
      const { data } = await api.get(`/support/chat/${chatId}`);
      setChat(data.data);
    } catch (err) {
      console.error(err);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', ({ chatId: msgChatId, message }) => {
      if (msgChatId === chatId) {
        setChat(prev => ({ ...prev, messages: [...prev.messages, message] }));
      }
    });
    return () => socket.off('new_message');
  }, [socket, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages?.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/chat/${chatId}/message`, { text });
      setText('');
      await fetchChat();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-modal z-[100] flex flex-col slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{chat?.subject || 'Support Chat'}</h3>
          <p className="text-xs text-gray-400 capitalize">{chat?.status}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chat?.messages?.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            isOwnMessage={msg.sender === user?._id || msg.sender?._id === user?._id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {chat?.status !== 'resolved' && (
        <form onSubmit={send} className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary !px-4 !py-2.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}