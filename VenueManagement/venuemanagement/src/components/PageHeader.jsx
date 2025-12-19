import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  User,
  Settings,
  Gift,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import ArrowRightBigIcon from "../assets/helperIcons/ArrowRightBigIcon";
import NotificationsIcon from "../assets/helperIcons/NotificationsIcon";
import HelpIcon from "../assets/helperIcons/HelpIcon";

const PageHeader = ({ title, backPath, actions, children }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef(null);
  const helpRef = useRef(null);
  const profileRef = useRef(null);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: "achievement",
      icon: <Gift className="w-4 h-4 text-yellow-500" />,
      avatar: "/api/placeholder/32/32",
      title: "Congratulation Lettie 🎉",
      description: "Won the monthly best seller gold badge",
      time: "1h ago",
      unread: true,
    },
    {
      id: 2,
      type: "connection",
      avatar: "CF",
      title: "Charles Franklin",
      description: "Accepted your connection",
      time: "12hr ago",
      unread: true,
    },
    {
      id: 3,
      type: "message",
      icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
      avatar: "/api/placeholder/32/32",
      title: "New Message 💬",
      description: "You have new message from Natalie",
      time: "1h ago",
      unread: false,
    },
    {
      id: 4,
      type: "order",
      icon: <ShoppingCart className="w-4 h-4 text-green-500" />,
      title: "Whoo! You have new order 🛒",
      description: "ACME Inc. made new order $1,154",
      time: "1 day ago",
      unread: true,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        helpRef.current &&
        !helpRef.current.contains(event.target)
      ) {
        setShowHelp(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (notification) => {
    if (notification.icon) {
      return (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {notification.icon}
        </div>
      );
    }
    return null;
  };

  const getAvatar = (notification) => {
    if (notification.avatar && notification.avatar.startsWith("/")) {
      return (
        <img
          src={notification.avatar}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    } else if (notification.avatar) {
      return (
        <div className="w-8 h-8 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-sm font-medium">
          {notification.avatar}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-gray-500" />
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 mx-auto">
          {/* Left section: back button + title */}
          <div className="flex items-center gap-4">
            {backPath && (
              // <button
              //   onClick={() => navigate(backPath)}
              //   className="flex items-center gap-1 text-gray-600 hover:text-purple-700 transition-colors"
              // >
              //    <ArrowRightBigIcon />
              //   <span>Back</span>
              // </button>
              <button
                onClick={() => navigate(backPath)}
                className="border rounded-full w-[26px] h-[26px] flex justify-center items-center"
              >
                <ArrowRightBigIcon />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>

          {/* Right section: actions + notification + account */}
          <div className="flex items-center gap-4">
            {/* Page-specific actions */}
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}

            {/* Notification and Account Icons */}
            <div className="flex items-center gap-2 ml-4 pl-4">
              {/* Notification Icon with Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Notifications"
                >
                  {/* <Bell className="w-5 h-5" /> */}
                  <NotificationsIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          Notification
                        </h3>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                          {unreadCount} New
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex-shrink-0 relative">
                            {getNotificationIcon(notification) ||
                              getAvatar(notification)}
                            {notification.icon && notification.avatar && (
                              <div className="absolute -top-1 -right-1">
                                {getNotificationIcon(notification)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>

                          {notification.unread && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100">
                      <button 
                        onClick={() => {
                          navigate('/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Icon with Dropdown */}
              <div className="relative" ref={helpRef}>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Help"
                >
                  <HelpIcon />
                </button>

                {/* Help Dropdown */}
                {showHelp && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Help & Support</h3>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          // Navigate to support or open support modal
                          setShowHelp(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Contact Support</p>
                          <p className="text-xs text-gray-500">Get help from our team</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          // Navigate to knowledge base or open docs
                          setShowHelp(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Knowledge Base</p>
                          <p className="text-xs text-gray-500">Browse help articles</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          // Open video tutorials
                          setShowHelp(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Video Tutorials</p>
                          <p className="text-xs text-gray-500">Watch how-to guides</p>
                        </div>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100">
                      <a
                        href="mailto:support@venuemanagement.com"
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        support@venuemanagement.com
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Icon with Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Account"
                >
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    JD
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">John Doe</p>
                          <p className="text-xs text-gray-500">john.doe@email.com</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-900">My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-900">Settings</span>
                      </button>

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={() => {
                          // Handle logout logic
                          setShowProfile(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm text-red-600 font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0">
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default PageHeader;
