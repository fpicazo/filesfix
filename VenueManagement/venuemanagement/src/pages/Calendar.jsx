import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import EventDrawer from '../components/EventDrawer'
import { Plus, ChevronLeft, ChevronRight, Edit2, Delete, MapPin, Users, Clock, X, Search, Filter, Calendar as CalendarIcon } from 'lucide-react'
import http from '../config/http'

const Calendar = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [eventsList, setEventsList] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [customersList, setCustomersList] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [viewMode, setViewMode] = useState('month')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const placeOptions = ['Jardín', 'Salón Principal', 'Terraza', 'Patio', 'Área VIP']
  const statusOptions = ['Pendiente', 'Confirmado', 'Cancelado']
  const eventTypeOptions = ['Boda', 'Cumpleaños', 'Aniversario', 'Corporativo', 'Social']

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await http.get('/api/events')
        console.log("Events fetched successfully:", response.data)
        setEventsList(response.data)
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }
    const fetchCustomers = async () => {
      try {
        const response = await http.get('/api/customers')
        setCustomersList(response.data)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }
    fetchCustomers()
    fetchEvents()
  }, [])

  const getCalendarData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    if (viewMode === 'week') {
      return getWeekData()
    }
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const prevMonth = new Date(year, month, 0)
    const daysFromPrevMonth = startingDayOfWeek
    
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7
    const daysFromNextMonth = totalCells - (daysInMonth + startingDayOfWeek)
    
    const calendarDays = []
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      calendarDays.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        day: prevMonth.getDate() - i
      })
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        day: day
      })
    }
    
    for (let day = 1; day <= daysFromNextMonth; day++) {
      calendarDays.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        day: day
      })
    }
    
    return calendarDays
  }

  const getWeekData = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(currentDate.getDate() - day)
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDays.push({
        date: date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        day: date.getDate()
      })
    }
    
    return weekDays
  }

  const getFilteredEvents = () => {
    let filtered = eventsList

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status?.toLowerCase() === statusFilter)
    }

    return filtered
  }

  const getEventsForDate = (date) => {
    const filteredEvents = getFilteredEvents()
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const goToPreviousMonth = () => {
    if (viewMode === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }
  }

  const goToNextMonth = () => {
    if (viewMode === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleEditEvent = (event) => {
    const formattedEvent = {
      ...event,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : ''
    }
    setEditingEvent(formattedEvent)
    setSelectedCustomer(event.customerId?._id)
    setDrawerOpen(true)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await http.delete(`/api/events/${eventId}`)
        setEventsList(prev => prev.filter(event => event._id !== eventId))
        setSelectedEvent(null)
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
  }

  const handleFormSubmit = (formData) => {
    console.log("Form submitted " + selectedCustomer)
    const eventData = {
      name: formData.name,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      status: formData.status,
      description: formData.description,
      customerId: selectedCustomer,
      eventType: formData.eventType,
      guests: formData.guests,
    }
    
    if (editingEvent) {
      const updatedEvent = { ...editingEvent, ...eventData }
      setEventsList(prev =>
        prev.map(event => (event._id === editingEvent._id ? updatedEvent : event))
      )
      http.put(`/api/events/${editingEvent._id}`, eventData)
        .then(response => {
          console.log("Event updated successfully:", response.data)
          setEventsList(prev =>
            prev.map(event => (event._id === editingEvent._id ? response.data : event))
          )
        })
        .catch(error => {
          console.error("Error updating event:", error)
        })
    } else {
      http.post('/api/events', eventData)
        .then(response => {
          console.log("Event added successfully:", response.data)
          setEventsList(prev => [...prev, response.data])
        })
        .catch(error => {
          console.error("Error adding event:", error)
        })
    }
    
    setDrawerOpen(false)
    setEditingEvent(null)
    setSelectedCustomer(null)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getHeaderTitle = () => {
    if (viewMode === 'week') {
      const weekData = getWeekData()
      const startDate = weekData[0].date
      const endDate = weekData[6].date
      
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`
      } else {
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${startDate.getFullYear()}`
      }
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const calendarRows = Math.ceil(getCalendarData().length / 7)

  return (
    <PageHeader title="Calendar" backPath="/">
      <div className="flex flex-col bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Filters Section */}
        {showFilters && (
          <div className="p-3 border-b bg-gray-50 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 min-w-64">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, customers, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter('all')
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Clear filters
                </button>
              )}

              <div className="text-sm text-gray-500">
                {getFilteredEvents().length} of {eventsList.length} events
              </div>
            </div>
          </div>
        )}

        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              {getHeaderTitle()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousMonth}
                className="p-1.5 hover:bg-gray-100 rounded-md"
                title={viewMode === 'week' ? 'Previous week' : 'Previous month'}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-md"
                title={viewMode === 'week' ? 'Next week' : 'Next month'}
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md ${
                showFilters 
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-3 w-3" />
              Filters
            </button>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm ${
                  viewMode === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm ${
                  viewMode === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
            </div>
            
            
            <button
              onClick={() => {
                setEditingEvent(null)
                setSelectedCustomer(null)
                setDrawerOpen(true)
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-1 flex-shrink-0">
            {dayNames.map(day => (
              <div key={day} className="text-center py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
            {getCalendarData().map((calendarDay, index) => {
              const dayEvents = getEventsForDate(calendarDay.date)
              const isToday = calendarDay.date.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={index}
                  className={`bg-white p-1.5 flex flex-col overflow-hidden ${
                    !calendarDay.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-purple-50' : ''}`}
                >
                  <div className={`text-xs font-semibold mb-1 flex-shrink-0 ${
                    isToday ? 'text-purple-600' : calendarDay.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {calendarDay.day}
                  </div>
                  
                  <div className="space-y-0.5 overflow-y-auto flex-1">
                    {dayEvents.slice(0, viewMode === 'week' ? 5 : 3).map(event => (
                      <div
                        key={event._id}
                        onClick={() => handleEventClick(event)}
                        className={`text-xs p-1 rounded border cursor-pointer hover:shadow transition ${getStatusColor(event.status)}`}
                      >
                        <div className="font-medium truncate text-xs leading-tight">{event.name}</div>
                        {event.time && (
                          <div className="text-xs opacity-75 truncate leading-tight">{event.time}</div>
                        )}
                        {viewMode === 'week' && (
                          <div className="text-xs opacity-75 truncate leading-tight">{event.customerId?.name}</div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > (viewMode === 'week' ? 5 : 3) && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - (viewMode === 'week' ? 5 : 3)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.name}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Customer:</span>
                <span>{selectedEvent.customerId?.name || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Date & Time:</span>
                <span>
                  {new Date(selectedEvent.date).toLocaleDateString()}
                  {selectedEvent.time && ` at ${selectedEvent.time}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span>{selectedEvent.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>
              </div>
              
              {selectedEvent.description && (
                <div className="text-sm">
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.guests > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Guests:</span>
                  <span>{selectedEvent.guests}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => handleEditEvent(selectedEvent)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Delete className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Drawer for Adding/Editing */}
      {drawerOpen && (
        <EventDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false)
            setEditingEvent(null)
          }}
          onSubmit={handleFormSubmit}
          customersList={customersList}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          editingEvent={editingEvent}
          placeOptions={placeOptions}
          statusOptions={statusOptions}
          eventTypeOptions={eventTypeOptions}
        />
      )}
    </PageHeader>
  )
}

export default Calendar