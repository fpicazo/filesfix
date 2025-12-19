// src/App.jsx
import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import Events from './pages/Events'
import Customers from './pages/Customers'
import Quotes from './pages/Quotes' 
import Expenses from './pages/Expenses'
import Analytics from './pages/Analytics'
import Register from './pages/Register'
import Login from './pages/Login'
import StaffPage from './pages/StaffPage'
import ProductPage from './pages/ProductPage' 
import IncidentsPage from './pages/IncidentsPage'
import Settings from './pages/Settings'
import CustomerDetail from './pages/CustomerDetail'
import EventDetail from './pages/EventDetail'
import QuoteDetail from './pages/QuotePage'
import Messaging from './pages/Messaging'
import Calendar from './pages/Calendar'
import InvoiceDetail from './pages/InvoiceDetail'
import Invoices from './pages/Invoice'
import RentalPage from './pages/RentalPage'
import EquipmentPage from './pages/EquipmentPage'
import TasksPage from './pages/TasksPage'
import PaymentsPage from './pages/PaymentsPage'
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Notifications from './pages/Notifications'

import PackagesPage from './pages/PackagesPage'

// Layout component that includes Sidebar and renders child routes
const Layout = () => {
  return (
    <div className="bg-[#FAFAFA] min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Outlet /> {/* This renders the matched child route */}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Routes>
          {/* Protected Routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/quotes/:id" element={<QuoteDetail />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/rental" element={<RentalPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/notifications" element={<Notifications />} />
              
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/staff" element={<StaffPage />} />
            </Route>
          </Route>
          
          {/* Public Routes without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App