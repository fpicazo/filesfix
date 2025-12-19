import React, { useState } from 'react';
import ContactListView from './ContactListView';
import ConversationView from './ConversationView';

// ============================================================================
// UTILITIES
// ============================================================================
export const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (id) => {
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

export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// ============================================================================
// DUMMY DATA
// ============================================================================
export const DUMMY_CONTACTS = [
  { id: 1, name: 'Sarah Johnson', status: 'online', lastMessage: 'Sounds good!' },
  { id: 2, name: 'Mike Chen', status: 'online', lastMessage: 'Let me check that' },
  { id: 3, name: 'Emma Davis', status: 'away', lastMessage: 'See you tomorrow' },
  { id: 4, name: 'John Smith', status: 'offline', lastMessage: 'Perfect, thanks!' },
  { id: 5, name: 'Lisa Wong', status: 'online', lastMessage: 'Great presentation!' },
];

export const DUMMY_MESSAGES = {
  1: [
    { id: 1, sender: 'contact', name: 'Sarah Johnson', type: 'text', content: 'Hey! How are you doing?', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, sender: 'user', type: 'text', content: 'Doing great, thanks for asking!', timestamp: new Date(Date.now() - 3500000) },
    { id: 3, sender: 'contact', name: 'Sarah Johnson', type: 'image', content: 'https://via.placeholder.com/250x200?text=Project+Screenshot', timestamp: new Date(Date.now() - 3400000) },
    { id: 4, sender: 'contact', name: 'Sarah Johnson', type: 'text', content: 'Just finished the design mockups', timestamp: new Date(Date.now() - 3350000) },
    { id: 5, sender: 'user', type: 'text', content: 'Sounds good!', timestamp: new Date(Date.now() - 3300000) },
  ],
  2: [
    { id: 1, sender: 'contact', name: 'Mike Chen', type: 'text', content: 'Are we still on for the meeting?', timestamp: new Date(Date.now() - 7200000) },
    { id: 2, sender: 'user', type: 'text', content: 'Yes, 3 PM works for me', timestamp: new Date(Date.now() - 7100000) },
    { id: 3, sender: 'contact', name: 'Mike Chen', type: 'file', content: 'proposal.pdf', fileSize: '2.4 MB', timestamp: new Date(Date.now() - 7000000) },
    { id: 4, sender: 'contact', name: 'Mike Chen', type: 'text', content: 'Let me check that', timestamp: new Date(Date.now() - 6900000) },
  ],
  3: [
    { id: 1, sender: 'user', type: 'text', content: 'How was the event?', timestamp: new Date(Date.now() - 86400000) },
    { id: 2, sender: 'contact', name: 'Emma Davis', type: 'image', content: 'https://via.placeholder.com/250x200?text=Event+Photo', timestamp: new Date(Date.now() - 86300000) },
    { id: 3, sender: 'contact', name: 'Emma Davis', type: 'text', content: 'It was amazing! Had a great time', timestamp: new Date(Date.now() - 86200000) },
    { id: 4, sender: 'user', type: 'text', content: 'That looks fun!', timestamp: new Date(Date.now() - 86100000) },
    { id: 5, sender: 'contact', name: 'Emma Davis', type: 'text', content: 'See you tomorrow', timestamp: new Date(Date.now() - 86000000) },
  ],
};

export const MESSAGE_TEMPLATES = [
  '👍 Sounds good!',
  '✅ Got it, thanks!',
  '⏰ Let me check and get back to you',
  '📞 Let\'s hop on a call',
  '💯 Perfect!',
];

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function MessagingApp() {
  const [selectedContactId, setSelectedContactId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState(DUMMY_MESSAGES);

  const selectedContact = DUMMY_CONTACTS.find((c) => c.id === selectedContactId);
  const currentMessages = messages[selectedContactId] || [];

  const handleSendMessage = (text) => {
    const newMessage = {
      id: (currentMessages.length || 0) + 1,
      sender: 'user',
      type: 'text',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMessage],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <ContactListView
        contacts={DUMMY_CONTACTS}
        selectedContactId={selectedContactId}
        onSelectContact={setSelectedContactId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ConversationView
        contact={selectedContact}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}