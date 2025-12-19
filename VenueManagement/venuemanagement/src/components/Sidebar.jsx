import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAccess } from "../hooks/useAccess";
import {
  Home,
  Calendar,
  Webhook,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Mail,
  Notebook,
  Ticket,
  LogOut,
  ShieldX,
  Shapes,
  ChevronRight,
  ChevronDown,
  ArrowDown,
} from "lucide-react";
import DashboardIcon from "../assets/helperIcons/DashbordIcon";
import MessageIcon from "../assets/helperIcons/MessageIcon";
import CalenderIcon from "../assets/helperIcons/CalendarIcon";
import ServicesIcon from "../assets/helperIcons/ServicesIcon";
import EventIcon from "../assets/helperIcons/EventIcon";
import FinancialIcon from "../assets/helperIcons/FinancialIcon";
import OperationsIcon from "../assets/helperIcons/OperationsIcon";
import SettingsIcon from "../assets/helperIcons/SettingsIcon";
import LogoutIcon from "../assets/helperIcons/LogoutIcon";
import logo from "../assets/images/logo.svg";
import ArrowDownIcon from "../assets/helperIcons/ArrowDownIcon";
import userImg from "../assets/images/Logomark.png";

const Sidebar = () => {
  const { logout } = useAuth();
  const { canAccess } = useAccess();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    events: true,
    sales: false,
    financial: false,
    operations: false,
  });

  // Modified toggleSection to close other sections when opening one
  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newState = {};
      // For each section, set it to true only if it's the clicked section AND it was previously closed
      Object.keys(prev).forEach(key => {
        newState[key] = key === section ? !prev[section] : false;
      });
      return newState;
    });
  };

  // Top level items with module mapping
  const topItems = [
    {
      name: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
      module: "dashboard",
    },
    {
      name: "Calendar",
      icon: <CalenderIcon />,
      path: "/calendar",
      module: "calendar",
    },
    {
      name: "Messaging",
      icon: <MessageIcon />,
      path: "/messaging",
      module: "messaging",
    },
  ];

  // Grouped menu sections with module mapping
  const menuSections = [
    {
      id: "events",
      title: "Event Management",
      icon: <ServicesIcon />,
      items: [
        {
          name: "Events",
          icon: <ServicesIcon />,
          path: "/events",
          module: "events",
        },
        {
          name: "Equipment",
          icon: <ServicesIcon />,
          path: "/equipment",
          module: "equipment",
        },
        {
          name: "Rental",
          icon: <ServicesIcon />,
          path: "/rental",
          module: "rental",
        },
        {
          name: "Packages",
          icon: <ServicesIcon />,
          path: "/packages",
          module: "packages",
        },
      ],
    },
    {
      id: "sales",
      title: "Sales & Customers",
      icon: <EventIcon />,
      items: [
        {
          name: "Customers",
          icon: <ServicesIcon />,
          path: "/customers",
          module: "customers",
        },
        {
          name: "Quotes",
          icon: <ServicesIcon />,
          path: "/quotes",
          module: "quotes",
        },
        {
          name: "Products",
          icon: <ServicesIcon />,
          path: "/products",
          module: "products",
        },
      ],
    },
    {
      id: "financial",
      title: "Financial",
      icon: <FinancialIcon />,
      items: [
        {
          name: "Invoices",
          icon: <ServicesIcon />,
          path: "/invoices",
          module: "invoices",
        },
        {
          name: "Payments",
          icon: <ServicesIcon />,
          path: "/payments",
          module: "payments",
        },
        {
          name: "Expenses",
          icon: <ServicesIcon />,
          path: "/expenses",
          module: "expenses",
        },
      ],
    },
    {
      id: "operations",
      title: "Operations",
      icon: <OperationsIcon />,
      items: [
        {
          name: "Analytics",
          icon: <ServicesIcon />,
          path: "/analytics",
          module: "analytics",
        },
        {
          name: "Staff",
          icon: <ServicesIcon />,
          path: "/staff",
          module: "staff",
        },
        {
          name: "Incidents",
          icon: <ServicesIcon />,
          path: "/incidents",
          module: "incidents",
        },
      ],
    },
  ];

  // Filter functions
  const getAccessibleItems = (items) => {
    return items.filter((item) => canAccess(item.module));
  };

  const getAccessibleSections = () => {
    return menuSections
      .map((section) => ({
        ...section,
        items: getAccessibleItems(section.items),
      }))
      .filter((section) => section.items.length > 0);
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (items) => items.some((item) => isActive(item.path));

  // Get filtered data
  const accessibleTopItems = getAccessibleItems(topItems);
  const accessibleSections = getAccessibleSections();

  return (
    <aside className="fixed top-0 left-0 z-30 flex flex-col w-64 h-screen bg-white border-r">
      {/* Logo / Brand */}
      <Link to="/" className="block px-8 py-4">
        <img src={logo} alt="logo" />
      </Link>
      <div className="flex gap-3 border p-2 mx-4 rounded-lg">
        <div className="w-[37px] h-[37px] rounded-lg">
          <img src={userImg} alt="userImg" />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-[#030712]">Garden Venue</p>
            <ArrowDownIcon />
          </div>
          <p className="text-xs text-[#8C8E91]">admin@gardenvenue.com</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Top Level Items - Only show if user has access */}
        {accessibleTopItems.length > 0 && (
          <ul className="space-y-1 mb-1">
            {accessibleTopItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                    isActive(item.path)
                      ? "text-[#240046]"
                      : "hover:bg-[#DED9E3] text-[#8E8C8F]"
                  }`}
                >
                  {React.cloneElement(item?.icon, {
                    color: isActive(item.path) ? "#240046" : "#8E8C8F",
                  })}

                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Grouped Sections - Only show sections with accessible items */}
        <div className="space-y-2">
          {accessibleSections.map((section) => {
            const isExpanded = expandedSections[section.id];
            const sectionActive = isSectionActive(section.items);

            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors font-medium ${
                    sectionActive
                      ? "text-[#240046]"
                      : "hover:bg-[#DED9E3] text-[#8E8C8F]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {React.cloneElement(section?.icon, {
                      color: sectionActive ? "#240046" : "#8E8C8F",
                    })}
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${
                    isExpanded ? 'rotate-90' : 'rotate-0'
                  }`} />
                </button>

                {/* Section Items - Only show accessible items */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="mt-1 ml-5 border-l border-[#E6E6E6] space-y-1">
                    {section.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <li
                          key={item.path}
                          className={`border-l ml-[-1px] ${
                            active ? "border-[#240046]" : "border-transparent"
                          }`}
                        >
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 ml-3 rounded-md transition-colors text-sm font-medium ${
                              active
                                ? "bg-[#DED9E3] text-[#240046]"
                                : "hover:bg-[#DED9E3] text-[#8E8C8F]"
                            }`}
                          >
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t space-y-1">
        {canAccess("settings") && (
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/settings")
                ? "text-[#240046]"
                : "hover:bg-[#DED9E3] text-[#8E8C8F]"
            }`}
          >
            <SettingsIcon
              color={isActive("/settings") ? "#240046" : "#8E8C8F"}
            />
            <span className="font-medium">Settings</span>
          </Link>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors w-full text-left"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;