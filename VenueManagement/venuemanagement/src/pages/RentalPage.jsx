import React, { useState, useEffect } from 'react'
import { Plus, Calendar, User, Wrench, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'

export default function RentalPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rentalsList, setRentalsList] = useState([])
  const [editingRental, setEditingRental] = useState(null)
  const [customersList, setCustomersList] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    customerId: "",
    equipmentId: "",
    startDate: "",
    endDate: "",
    price: "",
    status: "Pending",
    notes: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all required data
        const [rentalsRes, customersRes, equipmentRes] = await Promise.all([
          http.get('/api/rentals'),
          http.get('/api/customers'),
          http.get('/api/equipments')
        ])
        console.log("Fetched customers:", customersRes.data)
        console.log("Fetched rentals:", rentalsRes.data)
        
        setRentalsList(rentalsRes.data)
        setCustomersList(customersRes.data)
        setEquipmentList(equipmentRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Helper function to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customersList.find(c => c._id === customerId)
    return customer ? customer.name : 'Unknown Customer'
  }

  // Helper function to get equipment name by ID
  const getEquipmentName = (equipmentId) => {
    const equipment = equipmentList.find(e => e._id === equipmentId)
    return equipment ? equipment.name : 'Unknown Equipment'
  }

  // Calculate rental duration in days
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Check if rental is overdue
  const isOverdue = (endDate, status) => {
    if (status === 'Completed' || status === 'Cancelled') return false
    const today = new Date()
    const end = new Date(endDate)
    return end < today
  }

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      price: parseFloat(formData.price)
    }
    
    if (editingRental) {
      // Update existing rental in local state
      setRentalsList(prev =>
        prev.map(rental =>
          rental._id === formData._id ? { ...rental, ...submitData } : rental
        )
      )
      // Call API to update the rental
      try {
        await http.put(`/api/rentals/${formData._id}`, submitData)
      } catch (error) {
        console.error("Error updating rental:", error)
      }
    } else {
      // Call API to add the rental first to get the complete object
      try {
        const { data: newRental } = await http.post('/api/rentals', submitData)
        // Add new rental with server response to local state
        setRentalsList(prev => [...prev, newRental])
      } catch (error) {
        console.error("Error adding rental:", error)
      }
    }

    closeDrawer()
  }

  const deleteRental = async (id) => {
    if (window.confirm('Are you sure you want to delete this rental?')) {
      // Update local state using _id
      setRentalsList(prev => prev.filter(rental => rental._id !== id))
      try {
        await http.delete(`/api/rentals/${id}`)
      } catch (error) {
        console.error("Error deleting rental:", error)
      }
    }
  }

  const openDrawer = (rental = null) => {
    setEditingRental(rental)
    if (rental) {
      setFormData({
        ...rental,
        startDate: rental.startDate ? rental.startDate.split('T')[0] : '',
        endDate: rental.endDate ? rental.endDate.split('T')[0] : '',
        price: rental.price.toString()
      })
    } else {
      // Set default dates (today and tomorrow)
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      setFormData({
        customerId: "",
        equipmentId: "",
        startDate: today,
        endDate: tomorrowStr,
        price: "",
        status: "Pending",
        notes: ""
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingRental(null)
    setFormData({
      customerId: "",
      equipmentId: "",
      startDate: "",
      endDate: "",
      price: "",
      status: "Pending",
      notes: ""
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Auto-calculate price when equipment or dates change
  const handleEquipmentChange = (e) => {
    const equipmentId = e.target.value
    const equipment = equipmentList.find(eq => eq._id === equipmentId)
    
    setFormData(prev => {
      const newData = { ...prev, equipmentId }
      
      // Auto-calculate price if equipment has a price and dates are set
      if (equipment && prev.startDate && prev.endDate) {
        const duration = calculateDuration(prev.startDate, prev.endDate)
        newData.price = (equipment.price * duration).toString()
      }
      
      return newData
    })
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Auto-calculate price if equipment and both dates are set
      if (prev.equipmentId && newData.startDate && newData.endDate) {
        const equipment = equipmentList.find(eq => eq._id === prev.equipmentId)
        if (equipment) {
          const duration = calculateDuration(newData.startDate, newData.endDate)
          newData.price = (equipment.price * duration).toString()
        }
      }
      
      return newData
    })
  }

  const getStatusBadge = (status, rental) => {
    let statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
      'Overdue': 'bg-red-100 text-red-800'
    }
    
    // Check if rental is overdue
    const actualStatus = isOverdue(rental.endDate, status) ? 'Overdue' : status
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[actualStatus] || 'bg-gray-100 text-gray-800'}`}>
        {actualStatus}
      </span>
    )
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Customer",
      accessorKey: "customerId",
      cell: ({ row }) => {
        const customerName = getCustomerName(row.original.customerId)
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <p className="text-gray-800 font-medium">{customerName}</p>
          </div>
        )
      }
    },
    {
      header: "Equipment",
      accessorKey: "equipmentId",
      cell: ({ row }) => {
        const equipmentName = getEquipmentName(row.original.equipmentId)
        return (
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-gray-400" />
            <p className="text-gray-800">{equipmentName}</p>
          </div>
        )
      }
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      cell: (props) => (
        <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      cell: (props) => (
        <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Duration",
      accessorKey: "duration",
      cell: ({ row }) => {
        const duration = calculateDuration(row.original.startDate, row.original.endDate)
        return (
          <p className="text-sm font-medium text-gray-800 text-center">
            {duration} day{duration !== 1 ? 's' : ''}
          </p>
        )
      },
      isHideSort: true
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (props) => (
        <p className="text-gray-800 font-semibold">${props.getValue()?.toFixed(2)}</p>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: ({ row }) => getStatusBadge(row.original.status, row.original)
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Rental"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteRental(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Rental"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <PageHeader title="Rentals" backPath="/">
        <div className="min-h-screen bg-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading rentals...</p>
          </div>
        </div>
      </PageHeader>
    )
  }

  return (
    <PageHeader title="Rentals" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={rentalsList}
              columns={columns}
              dataNotFoundQuery="No rentals found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Rental
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Rental */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingRental ? "Edit Rental" : "New Rental"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Rental Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Customer *
                  </label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Customer</option>
                    {customersList.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Equipment *
                  </label>
                  <select
                    name="equipmentId"
                    value={formData.equipmentId}
                    onChange={handleEquipmentChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Equipment</option>
                    {equipmentList.filter(eq => eq.status === 'Available').map((equipment) => (
                      <option key={equipment._id} value={equipment._id}>
                        {equipment.name} - ${equipment.price}/day
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleDateChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleDateChange}
                    required
                    min={formData.startDate}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration and Price Display */}
              {formData.startDate && formData.endDate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Duration
                    </label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">
                      {calculateDuration(formData.startDate, formData.endDate)} days
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Total Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Notes
              </h3>
              
              <div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Add any additional notes about this rental..."
                />
              </div>
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
                {editingRental ? "Update Rental" : "Create Rental"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}