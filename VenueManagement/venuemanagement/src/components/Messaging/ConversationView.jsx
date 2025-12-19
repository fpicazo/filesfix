import React, { useEffect, useRef, useState } from 'react';
import { Send, FileText, Image, Paperclip, MessageCircle, MoreVertical } from 'lucide-react';

// Utility functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (id) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-indigo-500',
    'bg-red-500',
  ];
  return colors[id % colors.length];
};

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Message templates
const MESSAGE_TEMPLATES = [
  '👍 Sounds good!',
  '✅ Got it, thanks!',
  '⏰ Let me check and get back to you',
  '📞 Let\'s hop on a call',
  '💯 Perfect!',
];

// ============================================================================
// MESSAGE BUBBLE SUB-COMPONENT
// ============================================================================
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="text-sm leading-relaxed">{message.content}</p>;
      case 'image':
        return (
          <img
            src={message.content}
            alt="shared"
            className="max-w-xs rounded-lg"
          />
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <FileText size={20} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.content}</p>
              <p className="text-xs text-gray-500">{message.fileSize}</p>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative max-w-xs bg-black rounded-lg overflow-hidden">
            <div className="aspect-video flex items-center justify-center bg-gray-800">
              <p className="text-white text-center">📹 Video</p>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-3 p-3">
            <button className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-300">
              ▶️
            </button>
            <div className="flex-1">
              <div className="w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <p className="text-xs text-gray-500 mt-1">0:45</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-white">
          {getInitials(message.name || 'Contact')}
        </div>
      )}
      <div className={`max-w-xs ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
          }`}
        >
          {renderMessageContent()}
        </div>
        <span className="text-xs text-gray-500 mt-1 px-2">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// MESSAGE INPUT SUB-COMPONENT
// ============================================================================
const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateClick = (template) => {
    setMessage(template);
    setShowTemplates(false);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
      {/* Templates */}
      {showTemplates && (
        <div className="flex flex-wrap gap-2">
          {MESSAGE_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => handleTemplateClick(template)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {template}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        {/* Text Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24"
          rows="1"
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Image Button */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Send image">
            <Image size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* File Button */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Send file">
            <Paperclip size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Templates Button */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Quick templates"
          >
            <MessageCircle size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONVERSATION VIEW MAIN COMPONENT
// ============================================================================
const ConversationView = ({ contact, messages, onSendMessage }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">Select a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-semibold`}>
            {getInitials(contact.name)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h2>
            <p className="text-xs text-gray-500 capitalize">{contact.status}</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ConversationView;