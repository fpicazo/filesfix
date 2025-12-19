import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import http from '../../config/http';

const ClaveProdSearch = ({ value, onChange, placeholder = "Search Clave Prod", label = "Clave Prod" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial selected item if value is provided
  useEffect(() => {
    if (value && !selectedItem) {
      setSelectedItem({ codigo: value });
    }
  }, [value]);

  // Search API call with debounce
  const searchClaveProd = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    try {
      const { data } = await http.get(`/api/financials/clave-prod/search?query=${encodeURIComponent(query)}`);
      console.log('Search results:', data);
      // Handle the response structure with results array
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching clave prod:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchClaveProd(query);
    }, 300);
  };

  // Handle selecting an item from dropdown
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
    onChange(item.codigo, item);
  };

  // Handle clearing selection
  const handleClear = () => {
    setSelectedItem(null);
    setSearchQuery('');
    setSearchResults([]);
    onChange('', null);
  };

  // Handle focus on input
  const handleFocus = () => {
    if (searchQuery.length >= 2) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {selectedItem ? (
          // Display selected item
          <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{selectedItem.name || selectedItem.codigo}</span>
              {selectedItem.name && (
                <span className="text-xs text-gray-500 ml-2">({selectedItem.codigo})</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Search input
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Dropdown results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <p className="text-xs text-gray-500 mt-1">Code: {item.codigo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showDropdown && !isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">No code found</p>
              <p className="text-xs text-gray-500">Try a different search term or check the code spelling</p>
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        Type at least 2 characters to search
      </p>
    </div>
  );
};

export default ClaveProdSearch;
