import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Calendar,
  Ban,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

// Styles for the React Date Picker component
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__header {
    background-color: transparent !important;
    border-bottom: none !important;
    text-align: center;
    padding-top: 8px;
    padding-bottom: 8px;
    position: relative;
    border-top: 1px solid #EBEBEB !important;
    border-bottom: 1px solid #EBEBEB !important;
  }

  .react-datepicker {
    font-family: inherit;
    border: none;
    box-shadow: none;
    display:grid;
  }

  .react-datepicker__navigation {
    top: 11px;
    padding: 0;
    width:20px !important;
    height:17px !important;
  }

  .react-datepicker__navigation--previous {
    left: 1.5rem;
  }

  .react-datepicker__navigation--next {
    right: 1.5rem;
  }

  .react-datepicker__navigation-icon::before {
    border-width: 2px 2px 0 0;
    border-color: #5C5C5C;
  }

  .react-datepicker__month-container {
    // padding: 0 1rem;
    border-bottom: 1px solid #EBEBEB !important;
  }

   .react-datepicker__month-container .table {
    padding: 0 1rem;
  }

  .react-datepicker__month {
    padding: 1rem 0;
  }

  .react-datepicker__current-month {
    font-size: 14px;
    font-weight: 500;
    color: #5C5C5C;
  }

  .react-datepicker__day-names {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    text-align: center;
    margin-top: 1rem;
  }
  
  .react-datepicker__day-name {
    font-size: 14px;
    font-weight: 500;
    color: #A3A3A3;
    text-transform: uppercase;
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
  }

  .react-datepicker__week {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.25rem;
  }

  .react-datepicker__day, .react-datepicker__month-text, .react-datepicker__quarter-text, .react-datepicker__year-text {
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    text-align: center;
    border-radius: 9999px;
    transition: background-color 0.2s, color 0.2s;
    font-size: 14px;
    font-weight: 500;
    color:#5C5C5C;
  }

  .react-datepicker__day:hover {
    background-color: #e5e7eb;
    border-radius:50% !important;
  }

  .react-datepicker__day--selected {
    background-color: #240046 !important;
    color: white !important;
  }

  .react-datepicker__day--today {
    background-color: #e5e7eb;
    font-weight: 700;
    color: #111827;
  }
  
  .react-datepicker__day--outside-month {
    visibility: hidden;
  }

  .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 0.166rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const presetOptions = [
  {
    label: "Later this week",
    icon: Calendar,
    get date() {
      const today = new Date();
      // Find the next Thursday
      const nextThursday = new Date(today);
      nextThursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7));
      return nextThursday;
    },
    get display() {
      return "Thursday";
    },
    iconColor: "text-[#1FC16B]",
  },
  {
    label: "Next week",
    icon: CalendarDays,
    get date() {
      const today = new Date();
      // Find the next Monday
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + ((8 - today.getDay() + 7) % 7));
      return nextMonday;
    },
    get display() {
      const nextMonday = this.date;
      return dayjs(nextMonday).format("ddd, D MMM");
    },
    iconColor: "text-[#7D52F4]",
  },
  {
    label: "6 months from now",
    icon: Ban,
    get date() {
      const today = dayjs();
      return today.add(6, "month").toDate();
    },
    get display() {
      const sixMonthsFromNow = this.date;
      return dayjs(sixMonthsFromNow).format("ddd, D MMM");
    },
    iconColor: "text-[#FB3748]",
  },
];

const CustomDatePicker = ({ selectedDate, onChange, onClose }) => {
   const datePickerRef = useRef(null);
  const handlePresetSelect = (date) => {
    onChange(date);
  };

  const handleDateSelect = (date) => {
    onChange(date.toISOString());
  };

   // Detect outside click
 useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
      onClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [onClose]);

  return (
    <div className="flex justify-center items-center min-w-[368px]" >
      <style>{datePickerStyles}</style>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm md:max-w-md overflow-hidden" ref={datePickerRef}>
        {/* Header */}
        <div className="px-[16px] py-[14px] border-b border-[#EBEBEB] flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#A3A3A3]" />
            <span className="text-[#5C5C5C] font-medium text-sm">
              {selectedDate
                ? dayjs(selectedDate).format("DD MMMM YYYY")
                : "Select a date"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 text-[#5C5C5C]" />
          </button>
        </div>

        {/* Preset Options */}
        <div className="p-[8px]">
          {presetOptions.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-[10px] cursor-pointer py-[8px] px-[12px] rounded-md hover:bg-[#F7F7F7] transition-colors"
              onClick={() => handlePresetSelect(option.date)}
            >
              <option.icon className={`w-5 h-5 ${option?.iconColor}`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#5C5C5C]">
                  {option.label}
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium text-right">
                {option.display}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div>
          <DatePicker
            dateFormat="yyyy-mm-dd"
            selected={selectedDate}
            onChange={handleDateSelect}
            inline
          />
        </div>

        {/* Footer */}
        <div className="p-[16px] flex space-x-[16px] w-full">
          <button onClick={onClose} className="px-6 py-1 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors w-full border border-[#EBEBEB]">
            Cancel
          </button>
          <button className="px-6 py-1.5 rounded-lg bg-[#4f2a7a] text-white font-medium bg-primary transition-colors w-full">
            Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDatePicker;
