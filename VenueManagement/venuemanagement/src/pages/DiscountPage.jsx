import React from 'react'
import DiscountManagement from '../components/Settings/DiscountManagement'

export default function DiscountPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Discount Management</h1>
          <p className="text-gray-600 mt-1">Manage your discount offers and pricing strategies</p>
        </div>
      </header>
      
      <div className="bg-gray-50">
        <DiscountManagement />
      </div>
    </div>
  )
}