import React from 'react';
import { Search } from 'lucide-react';
import { getInitials, getAvatarColor } from './MessagingApp';

const ContactListView = ({ contacts, selectedContactId, onSelectContact, searchQuery, onSearchChange }) => {
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
        
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors ${
              selectedContactId === contact.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-semibold text-sm`}>
                  {getInitials(contact.name)}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                    contact.status === 'online'
                      ? 'bg-green-500'
                      : contact.status === 'away'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{contact.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContactListView;