import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';

export default function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwnMessage
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          {message.text}
        </div>
        <span className="text-[11px] text-gray-400 mt-1 px-1">
          {message.senderRole !== 'user' && !isOwnMessage && (
            <span className="font-semibold text-primary-500 mr-1">Support · </span>
          )}
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}