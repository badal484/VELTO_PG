import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';
import { useSocket } from '../../context/SocketContext';

const STATUS_BADGE = { open: 'badge-warning', in_progress: 'badge-primary', resolved: 'badge-neutral' };

export default function AdminSupport() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/support/chats?status=${activeTab}`);
      setChats(data.data);
    } catch {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [activeTab]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', ({ chatId, message }) => {
      // Update chat list last message/unread count
      setChats(prev => prev.map(c => {
        if (c._id === chatId) {
          return { ...c, lastMessage: new Date(), unreadByAdmin: c.unreadByAdmin + (message.senderRole !== 'admin' ? 1 : 0) };
        }
        return c;
      }));

      // Update current chat messages
      if (activeChat?._id === chatId) {
        setMessages(prev => [...prev, message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('new_support_chat', () => {
      if (activeTab === 'open') fetchChats();
    });

    return () => {
      socket.off('new_message');
      socket.off('new_support_chat');
    };
  }, [socket, activeChat, activeTab]);

  const openChat = async (chat) => {
    setActiveChat(chat);
    try {
      const { data } = await api.get(`/support/chat/${chat._id}`);
      setMessages(data.data.messages || []);
      // Reset unread locally
      setChats(prev => prev.map(c => c._id === chat._id ? { ...c, unreadByAdmin: 0 } : c));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeChat) return;
    setSending(true);
    try {
      const { data } = await api.post(`/support/chat/${activeChat._id}/message`, { text: reply });
      setMessages(prev => [...prev, data.data]);
      setReply('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const resolveChat = async () => {
    try {
      await api.put(`/admin/support/${activeChat._id}/resolve`);
      toast.success('Chat resolved');
      setActiveChat(c => ({ ...c, status: 'resolved' }));
      setChats(prev => prev.map(c => c._id === activeChat._id ? { ...c, status: 'resolved' } : c));
    } catch {
      toast.error('Failed to resolve');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 mt-1">Customer support chats</p>
      </div>

      <div className="flex h-[calc(100vh-200px)] gap-4 min-h-0">
        {/* Chat list */}
        <div className="w-72 flex-shrink-0 flex flex-col card overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex gap-1">
              {['open', 'in_progress', 'resolved'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}>
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="p-4"><Loader /></div> : chats.length === 0 ? (
              <EmptyState title="No chats" description="" />
            ) : (
              chats.map(chat => (
                <button key={chat._id} onClick={() => openChat(chat)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-all ${activeChat?._id === chat._id ? 'bg-primary-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{chat.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{chat.user?.name}</p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(chat.lastMessage)}</p>
                    </div>
                    {chat.unreadByAdmin > 0 && (
                      <span className="w-4 h-4 bg-primary-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                        {chat.unreadByAdmin}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col card overflow-hidden min-w-0">
          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400">Select a chat to view messages</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="font-bold text-gray-900">{activeChat.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">{activeChat.user?.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${activeChat.user?.role === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {activeChat.user?.role || 'user'}
                    </span>
                    <span className="text-gray-300">·</span>
                    <p className="text-xs text-gray-400 capitalize">{activeChat.category?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={STATUS_BADGE[activeChat.status] || 'badge-neutral'}>{activeChat.status?.replace('_', ' ')}</span>
                  {activeChat.status !== 'resolved' && (
                    <button onClick={resolveChat} className="btn-secondary text-xs py-1.5 px-3">Resolve</button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.senderRole === 'admin'
                        ? 'bg-primary-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.senderRole === 'admin' ? 'text-primary-200' : 'text-gray-400'}`}>
                        {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {activeChat.status !== 'resolved' && (
                <form onSubmit={sendReply} className="p-4 border-t border-gray-100 flex gap-2">
                  <input className="input-field flex-1 py-2.5" value={reply} onChange={e => setReply(e.target.value)}
                    placeholder="Type a reply…" />
                  <button type="submit" disabled={sending || !reply.trim()} className="btn-primary py-2.5 px-4 disabled:opacity-50">
                    {sending ? '…' : 'Send'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}