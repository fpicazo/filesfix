import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Users, FileText, CreditCard, BarChart3, BookText, UserCheck, ShieldX, Mail, Wrench, Clipboard } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const DashboardCards = () => {
  const apps = [
    {
      name: "New Event",
      description: "Create a new event booking",
      icon: Plus,
      path: "/events/new",
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Events",
      description: "Manage all venue bookings",
      icon: Calendar,
      path: "/events",
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Customers",
      description: "View and manage customers",
      icon: Users,
      path: "/customers",
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Equipment",
      description: "Manage venue equipment and assets",
      icon: Wrench,
      path: "/equipment",
      color: "bg-lime-100 text-lime-800",
    },
    {
      name: "Rentals",
      description: "Track equipment rentals and bookings",
      icon: Clipboard,
      path: "/rental",
      color: "bg-pink-100 text-pink-800",
    },
    {
      name: "Quotes",
      description: "Create and manage quotes",
      icon: FileText,
      path: "/quotes",
      color: "bg-amber-100 text-amber-800",
    },
    {
      name: "Facturas",
      description: "Create and manage invoices",
      icon: BookText,
      path: "/invoices",
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      name: "Staff",
      description: "Manage team members and roles",
      icon: UserCheck,
      path: "/staff",
      color: "bg-orange-100 text-orange-800",
    },
    {
      name: "Tasks",
      description: "Manage team tasks and assignments",
      icon: UserCheck,
      path: "/tasks",
      color: "bg-pink-100 text-pink-800",
    },
    {
      name: "Incidents",
      description: "Track and manage incidents",
      icon: ShieldX,
      path: "/incidents",
      color: "bg-rose-100 text-rose-800",
    },
    {
      name: "Messaging",
      description: "Communicate with clients",
      icon: Mail,
      path: "/messaging",
      color: "bg-teal-100 text-teal-800",
    },
    {
      name: "Expenses",
      description: "Track venue expenses",
      icon: CreditCard,
      path: "/expenses",
      color: "bg-red-100 text-red-800",
    },
    {
      name: "Analytics",
      description: "View business insights",
      icon: BarChart3,
      path: "/analytics",
      color: "bg-indigo-100 text-indigo-800",
    },
  ]

  return (
     <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Link key={app.path} to={app.path}>
            <div className="hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200 rounded-lg">
              <div className="p-6 flex items-start gap-4 bg-white">
                <div className={`p-3 rounded-lg ${app.color}`}>
                  <app.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-xl">{app.name}</h3>
                  <p className="text-sm text-gray-500">{app.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DashboardCards