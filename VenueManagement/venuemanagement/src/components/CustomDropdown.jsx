import { useEffect, useRef, useState } from "react";
import SwipeIcon from "../assets/helperIcons/SwipeIcon";

const CustomDropdown = ({
  products,
  handleNewItemProductSelect,
  formatCurrency,
  selected,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const handleSelect = (productId) => {
    handleNewItemProductSelect(productId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProduct = products.find((p) => p._id === selected);

  return (
    <div className="relative w-full text-sm" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <SwipeIcon />
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-2 py-1 text-left flex justify-between items-center focus:outline-none focus:ring-0 focus:ring-purple-500 rounded ${
            disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
          }`}
        >
          <span>
            {disabled
              ? "Package Item"
              : selectedProduct
              ? `${selectedProduct.name}`
              : "Select Product"}
          </span>

          {!disabled && (
            <svg
              className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full min-w-[300px] bg-white border border-gray-300 rounded shadow-sm max-h-72 overflow-y-auto">
          {/* Search input */}
          <div className="p-2 relative">
            <svg
              className="w-4 h-4 text-gray-400 absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F7F8] p-[8px] pl-7 text-xs rounded focus:outline-none focus:ring-0 focus:ring-purple-500"
            />
          </div>

          {/* Product List */}
          <ul className="max-h-72 overflow-y-auto">
            {filteredProducts.map((product) => (
              <li
                key={product._id}
                onClick={() => handleSelect(product._id)}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-gray-800 flex justify-between items-center"
              >
                <span className="truncate">{product.name}</span>
                <span className="ml-2 text-gray-500 text-xs">
                  {formatCurrency(product.price)}
                </span>
              </li>
            ))}

            {/* + Add New */}
            <li
              onClick={() => handleSelect("add_new")}
              className="cursor-pointer border-t border-gray-200 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              + Add New Product
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
