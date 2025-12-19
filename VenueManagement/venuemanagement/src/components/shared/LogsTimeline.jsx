import React from "react";
import {
  Phone,
  Mail,
  Edit3,
  DollarSign,
  FileText,
  Receipt,
  Upload
} from "lucide-react";
import { formatDateToDMY } from "../../utils/formatDate";

// Map activity types to icons
const iconMap = {
  call: <Phone className="w-4 h-4 text-purple-600" />,
  email: <Mail className="w-4 h-4 text-blue-600" />,
  edited: <Edit3 className="w-4 h-4 text-orange-600" />,
  payment: <DollarSign className="w-4 h-4 text-green-600" />,
  quote: <FileText className="w-4 h-4 text-purple-600" />,
  invoice: <Receipt className="w-4 h-4 text-indigo-600" />,
  import: <Upload className="w-4 h-4 text-gray-600" />,
};

export default function LogsTimeline({ activities = [], title = "Logs Timeline" }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <h2 className="text-lg font-bold mb-4">{title}</h2>

      {/* Empty State */}
      {activities.length === 0 && (
        <p className="text-sm text-gray-500">No activity yet.</p>
      )}

      {/* Timeline Items */}
      {activities.map((item, index) => (
        <div
          key={index}
          className="flex gap-3 items-start py-4 border-b border-gray-200 last:border-none"
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            {iconMap[item.type] || iconMap["edited"]}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm text-gray-900 font-medium">{item.detail}</p>

            {item.user && (
              <p className="text-xs text-gray-500 mt-0.5">By {item.user}</p>
            )}

            <p className="text-xs text-gray-400 mt-1">
              {formatDateToDMY(item.time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
