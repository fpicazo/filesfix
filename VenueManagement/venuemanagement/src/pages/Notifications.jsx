import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Clock,
  Settings as SettingsIcon,
  ListTodo,
} from "lucide-react";

const Notifications = () => {
  // Dummy notifications data based on the schema
  const dummyNotifications = [
    {
      id: "1",
      type: "event",
      title: "Event Starting Soon",
      message: "Wedding event 'Smith-Johnson Wedding' starts in 2 hours",
      read: false,
      priority: "high",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/events/688bf95cac0a69e5b94fabee",
      actionLabel: "View Event",
      metadata: { eventName: "Smith-Johnson Wedding" },
    },
    {
      id: "2",
      type: "invoice",
      title: "Payment Received",
      message: "Payment of $2,500 received for Invoice #INV-2025-005",
      read: false,
      priority: "medium",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/invoices/68e84d94bdeb66be31ad81e9",
      actionLabel: "View Invoice",
      metadata: { amount: 2500, invoiceNumber: "INV-2025-005" },
    },
    {
      id: "3",
      type: "quote",
      title: "Quote Accepted",
      message: "Customer 'test new' has accepted quote QUO-2025-012",
      read: true,
      priority: "medium",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/quotes/123",
      actionLabel: "View Quote",
      metadata: { quoteNumber: "QUO-2025-012", customerName: "test new" },
    },
    {
      id: "4",
      type: "reminder",
      title: "Payment Due Tomorrow",
      message: "Invoice #INV-2025-001 payment of $696 is due tomorrow",
      read: false,
      priority: "urgent",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/invoices/688d0bd63e415246a79c5f4c",
      actionLabel: "View Invoice",
      metadata: { dueAmount: 696, invoiceNumber: "INV-2025-001" },
    },
    {
      id: "5",
      type: "staff",
      title: "Staff Assignment Required",
      message: "Event 'Corporate Gala' needs 3 more staff members assigned",
      read: false,
      priority: "high",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/events/456/staff",
      actionLabel: "Assign Staff",
      metadata: { eventName: "Corporate Gala", staffNeeded: 3 },
    },
    {
      id: "6",
      type: "customer",
      title: "New Customer Registration",
      message: "New customer 'John Anderson' has been added to the system",
      read: true,
      priority: "low",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/customers/789",
      actionLabel: "View Customer",
      metadata: { customerName: "John Anderson" },
    },
    {
      id: "7",
      type: "task",
      title: "Task Overdue",
      message: "Setup decoration task for 'Birthday Party' is overdue",
      read: false,
      priority: "urgent",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/tasks/101",
      actionLabel: "View Task",
      metadata: { taskName: "Setup decoration", eventName: "Birthday Party" },
    },
    {
      id: "8",
      type: "system",
      title: "System Maintenance Scheduled",
      message: "System maintenance is scheduled for tonight at 11 PM",
      read: true,
      priority: "medium",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      scheduledFor: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(),
      metadata: { maintenanceDuration: "2 hours" },
    },
    {
      id: "9",
      type: "invoice",
      title: "Invoice Overdue",
      message: "Invoice #INV-2025-003 is 5 days overdue",
      read: false,
      priority: "urgent",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/invoices/999",
      actionLabel: "View Invoice",
      metadata: { overdueAmount: 3500, daysOverdue: 5 },
    },
    {
      id: "10",
      type: "event",
      title: "Event Completed",
      message: "Event 'Anniversary Celebration' has been marked as completed",
      read: true,
      priority: "low",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/events/202",
      actionLabel: "View Event",
      metadata: { eventName: "Anniversary Celebration" },
    },
  ];

  const [notifications, setNotifications] = useState(dummyNotifications);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type) => {
    const iconMap = {
      event: <Calendar className="w-5 h-5" />,
      invoice: <DollarSign className="w-5 h-5" />,
      quote: <FileText className="w-5 h-5" />,
      reminder: <Clock className="w-5 h-5" />,
      system: <SettingsIcon className="w-5 h-5" />,
      staff: <Users className="w-5 h-5" />,
      customer: <Users className="w-5 h-5" />,
      task: <ListTodo className="w-5 h-5" />,
    };
    return iconMap[type] || <Bell className="w-5 h-5" />;
  };

  const getTypeColor = (type) => {
    const colorMap = {
      event: "bg-blue-100 text-blue-600",
      invoice: "bg-green-100 text-green-600",
      quote: "bg-purple-100 text-purple-600",
      reminder: "bg-yellow-100 text-yellow-600",
      system: "bg-gray-100 text-gray-600",
      staff: "bg-orange-100 text-orange-600",
      customer: "bg-pink-100 text-pink-600",
      task: "bg-teal-100 text-teal-600",
    };
    return colorMap[type] || "bg-gray-100 text-gray-600";
  };

  const getPriorityBadge = (priority) => {
    const badgeMap = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      urgent: "bg-red-100 text-red-600",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badgeMap[priority]}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <PageHeader title="Notifications" backPath="/">
      <div className="max-w-5xl mx-auto">
        {/* Header Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All Notifications
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                You have{" "}
                <span className="font-semibold text-purple-600">
                  {unreadCount}
                </span>{" "}
                unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filter:
              </span>
            </div>

            {/* Read/Unread Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "read"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Read
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="invoice">Invoices</option>
              <option value="quote">Quotes</option>
              <option value="reminder">Reminders</option>
              <option value="staff">Staff</option>
              <option value="customer">Customers</option>
              <option value="task">Tasks</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications to display</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border ${
                  notification.read
                    ? "border-gray-200"
                    : "border-purple-300 bg-purple-50"
                } p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold text-gray-900 ${
                              !notification.read ? "font-bold" : ""
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.type}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    {notification.actionUrl && notification.actionLabel && (
                      <div className="mt-3">
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {notification.actionLabel}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageHeader>
  );
};

export default Notifications;