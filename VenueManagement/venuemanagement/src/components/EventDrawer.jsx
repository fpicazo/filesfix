// src/components/EventDrawer.jsx
import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, FileText, User, Tag } from 'lucide-react'
import DrawerWrapper from './DrawerWrapper'

const EventDrawer = ({ 
  open, 
  onClose, 
  onSubmit, 
  customersList = [], 
  selectedCustomer, 
  setSelectedCustomer, 
  editingEvent,
  placeOptions = ['Jardín', 'Salón Principal', 'Terraza', 'Patio', 'Área VIP'],
  statusOptions = ['Pendiente', 'Confirmado', 'Cancelado'],
  eventTypeOptions = ['Boda', 'Cumpleaños', 'Aniversario', 'Corporativo', 'Social']
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    status: 'Pendiente',
    description: '',
    guests: 0,
    eventType: ''
  })

  useEffect(() => {
    if (editingEvent) {
      const eventDateTime = editingEvent.date ? new Date(editingEvent.date) : new Date()
      setFormData({
        name: editingEvent.name || '',
        location: editingEvent.location || '',
        date: editingEvent.date ? eventDateTime.toISOString().split('T')[0] : '',
        time: editingEvent.time || (editingEvent.date ? eventDateTime.toTimeString().split(' ')[0].substring(0, 5) : ''),
        status: editingEvent.status || 'Pendiente',
        description: editingEvent.description || '',
        guests: editingEvent.guests || 0,
        eventType: editingEvent.eventType || ''
      })
    } else {
      setFormData({
        name: '',
        location: '',
        date: '',
        time: '',
        status: 'Pendiente',
        description: '',
        guests: 0,
        eventType: ''
      })
    }
  }, [editingEvent])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.location || !formData.date || !formData.eventType) {
      alert('Please fill in all required fields')
      return
    }
    
    // Pass the formData directly instead of the event
    onSubmit(formData)
    
    if (!editingEvent) {
      setFormData({
        name: '',
        location: '',
        date: '',
        time: '',
        status: 'Pendiente',
        description: '',
        guests: 0,
        eventType: ''
      })
    }
  }

  return (
    <DrawerWrapper
      open={open}
      onClose={onClose}
      title={editingEvent ? 'Edit Event' : 'Create New Event'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Customer
            </label>
            <select
              name="customer"
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a customer</option>
              {customersList.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Event Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select location</option>
                {placeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select event type</option>
                {eventTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Description
          </h3>
          
          <div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter event description, special requirements, notes..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            {editingEvent ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </DrawerWrapper>
  )
}

export default EventDrawer