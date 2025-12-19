import React, { useState, useEffect } from 'react'
import { Plus, AlertTriangle, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'
import FileImport from '../components/shared/FileList'

export default function IncidentsPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [incidentsList, setIncidentsList] = useState([])
  const [editingIncident, setEditingIncident] = useState(null)
  const [eventsList, setEventsList] = useState([])
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventId: "",
    cost: "",
    category: ""
  })

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data } = await http.get('/api/incidents')
        console.log("Fetched incidents:", data)
        setIncidentsList(data)
      } catch (error) {
        console.error("Error fetching incidents:", error)
      }
    }
    
    const fetchEvents = async () => {
      try {
        const { data } = await http.get('/api/events')
        setEventsList(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }
    
    fetchIncidents()
    fetchEvents()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    const incidentData = {
      ...formData,
      cost: parseFloat(formData.cost)
    }
    
    if (editingIncident) {
      // Update existing incident in local state
      setIncidentsList(prev =>
        prev.map(incident =>
          incident._id === editingIncident._id ? { ...incident, ...incidentData } : incident
        )
      )
      try {
        await http.put(`/api/incidents/${editingIncident._id}`, incidentData)
      } catch (error) {
        console.error("Error updating incident:", error)
      }
    } else {
      // Add new incident
      try {
        const { data: newIncident } = await http.post('/api/incidents', incidentData)
        setIncidentsList(prev => [...prev, newIncident])
      } catch (error) {
        console.error("Error adding incident:", error)
      }
    }

    closeDrawer()
  }

  const deleteIncident = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      setIncidentsList(prev => prev.filter(incident => incident._id !== id))
      try {
        await http.delete(`/api/incidents/${id}`)
      } catch (error) {
        console.error("Error deleting incident:", error)
      }
    }
  }

  const openDrawer = (incident = null) => {
    setEditingIncident(incident)
    if (incident) {
      setFormData({
        ...incident,
        eventId: incident.eventId?._id || incident.eventId || "",
        cost: incident.cost?.toString() || "",
        category: incident.category || ""
      })
    } else {
      setFormData({
        name: "",
        description: "",
        eventId: "",
        cost: "",
        category: ""
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingIncident(null)
    setFormData({
      name: "",
      description: "",
      eventId: "",
      cost: "",
      category: ""
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Get event name - handle both populated and non-populated eventId
  const getEventName = (eventData) => {
    if (eventData && typeof eventData === 'object' && eventData.name) {
      return eventData.name
    }
    if (typeof eventData === 'string') {
      const event = eventsList.find(e => e._id === eventData)
      return event ? event.name || `${event.eventType} - ${formatDateToDMY(event.date)}` : 'Unknown Event'
    }
    return 'Unknown Event'
  }

  const getCategoryBadge = (category) => {
    const categoryColors = {
      'Equipment Damage': 'bg-orange-100 text-orange-800',
      'Property Damage': 'bg-red-100 text-red-800',
      'Safety Issue': 'bg-red-100 text-red-800',
      'Guest Complaint': 'bg-yellow-100 text-yellow-800',
      'Staff Issue': 'bg-purple-100 text-purple-800',
      'Weather Related': 'bg-blue-100 text-blue-800',
      'Vendor Issue': 'bg-indigo-100 text-indigo-800',
      'Security Issue': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category || 'Uncategorized'}
      </span>
    )
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Incident",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="text-gray-800 font-medium">{row.original.name}</p>
        </div>
      )
    },
    {
      header: "Category",
      accessorKey: "category",
      meta: { filterVariant: "select", defaultLabel: "All Categories" },
      cell: ({ row }) => getCategoryBadge(row.original.category)
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (props) => {
        const desc = props.getValue() || ''
        return (
          <p className="text-gray-600 truncate max-w-xs" title={desc}>
            {desc.length > 50 ? desc.slice(0, 50) + "..." : desc}
          </p>
        )
      },
      isHideSort: true
    },
    {
      header: "Related Event",
      accessorKey: "eventId",
      cell: ({ row }) => (
        <p className="text-gray-800">{getEventName(row.original.eventId)}</p>
      )
    },
    {
      header: "Cost",
      accessorKey: "cost",
      cell: (props) => (
        <p className="text-gray-800 font-semibold">{formatCurrency(props.getValue())}</p>
      )
    },
    {
      header: "Date Reported",
      accessorKey: "createdAt",
      cell: (props) => (
        <p className="text-gray-600">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Incident"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteIncident(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Incident"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Incidents" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={incidentsList}
              columns={columns}
              dataNotFoundQuery="No incidents reported yet"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Report Incident
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Incident */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingIncident ? "Edit Incident" : "Report New Incident"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Incident Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Incident Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Incident Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief incident title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Equipment Damage">Equipment Damage</option>
                  <option value="Property Damage">Property Damage</option>
                  <option value="Safety Issue">Safety Issue</option>
                  <option value="Guest Complaint">Guest Complaint</option>
                  <option value="Staff Issue">Staff Issue</option>
                  <option value="Weather Related">Weather Related</option>
                  <option value="Vendor Issue">Vendor Issue</option>
                  <option value="Security Issue">Security Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Related Event
                </label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Event</option>
                  {eventsList.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name || `${event.eventType} - ${formatDateToDMY(event.date)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Associated Cost
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter any costs associated with this incident (damages, repairs, etc.)
                </p>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Incident Details
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Provide a detailed description of what happened, when it occurred, who was involved, and any immediate actions taken..."
                />
              </div>
              
              <FileImport module="incidents" parentId={formData._id} files={formData?.related?.attachments} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                {editingIncident ? "Update Incident" : "Report Incident"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}