import React, { useState, useEffect } from 'react'
import { Plus, Edit2, MessageCircleMore, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import http from '../config/http'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import RightIcon from '../assets/helperIcons/RightIcon'

export default function CustomersPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [customerList, setCustomerList] = useState([])
  const [editingCustomer, setEditingCustomer] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch initial customer data from the server
    const fetchCustomers = async () => {
      try {
        const response = await http.get('/api/customers')
        setCustomerList(response.data)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }
    fetchCustomers()
  }, [])

  // Helper to get initials from name
  const getInitials = (name = "") => {
    const parts = name.trim().split(" ")
    const first = parts[0]?.[0] || ""
    const second = parts[1]?.[0] || ""
    return (first + second).toUpperCase()
  }

  // Form submission handler: update if editing, add new if not
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const form = e.target
    const customerData = {
      name: form.name.value,
      subText: form.subText.value,
      email: form.email.value,
      phone: form.phone.value
    }
    
    if (editingCustomer) {
      // Update existing customer in local state
      setCustomerList(prev =>
        prev.map(cust => 
          cust._id === editingCustomer._id ? { ...cust, ...customerData } : cust
        )
      )
      
      try {
        await http.put(`/api/customers/${editingCustomer._id}`, customerData)
      } catch (error) {
        console.error("Error updating customer:", error)
      }
    } else {
      // Add new customer
      try {
        const { data: newCustomer } = await http.post('/api/customers', customerData)
        setCustomerList(prev => [...prev, newCustomer])
      } catch (error) {
        console.error("Error adding customer:", error)
      }
    }
    
    closeDrawer()
    form.reset()
  }

  const handleAbrirDetalle = (id) => {
    navigate(`/customers/${id}`)
  }

  const deleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      // Update local state using _id
      setCustomerList(prev => prev.filter(cust => cust._id !== id))
      
      try {
        await http.delete(`/api/customers/${id}`)
      } catch (error) {
        console.error("Error deleting customer:", error)
      }
    }
  }

  const formatPhone = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    // Prepend +52 to the cleaned number
    return `+52${digits}`
  }

  const openMessage = (phone) => {
    const formattedPhone = formatPhone(phone)
    window.open(`https://wa.me/${formattedPhone}`, '_blank')
  }

  const openDrawer = (customer = null) => {
    setEditingCustomer(customer)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingCustomer(null)
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Customer",
      accessorKey: "name",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex items-center gap-3">
           
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-semibold">
              {getInitials(customer.name)}
            </div>
            <div>
              <p className="text-gray-800 font-medium">{customer.name}</p>
              {customer.subText && (
                <p className="text-xs text-gray-500">{customer.subText}</p>
              )}
            </div>
             <MessageCircleMore
              className="h-5 w-5 text-green-500 cursor-pointer hover:text-green-600"
              onClick={() => openMessage(customer.phone)}
              title="Send WhatsApp message"
            />
          </div>
        )
      }
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: ({ row }) => (
        <div>
          <p className="text-gray-800">{row.original.email}</p>
          <p className="text-xs text-gray-500">{row.original.phone}</p>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: (props) => (
        <p className="text-gray-800 text-center">{props.getValue() || '-'}</p>
      )
    },
    {
      header: "Events",
      accessorKey: "events",
      cell: (props) => (
        <p className="text-gray-800 text-center font-medium">{props.getValue() || 0}</p>
      )
    },
    {
      header: "Quotes",
      accessorKey: "quotes",
      cell: (props) => (
        <p className="text-gray-800 text-center font-medium">{props.getValue() || 0}</p>
      )
    },
    {
      header: "Last Event",
      accessorKey: "lastEvent",
      cell: ({ row }) => {
        const lastEvent = row.original.lastEvent
        return (
          <p className="text-gray-800 text-center">
            {lastEvent?.date ? formatDateToDMY(lastEvent.date) : "No events"}
          </p>
        )
      },
      isHideSort: true
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleAbrirDetalle(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="View Details"
          >
            Details
            <RightIcon />
          </button>
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Customer"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteCustomer(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Customer"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Customers" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={customerList}
              columns={columns}
              dataNotFoundQuery="No customers found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Customer
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Customer */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        >
          {/* Use key so the form re-mounts when editingCustomer changes */}
          <form 
            key={editingCustomer ? editingCustomer._id : 'new'} 
            onSubmit={handleFormSubmit} 
            className="space-y-6"
          >
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Customer Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Name *
                </label>
                <input
                  name="name"
                  defaultValue={editingCustomer ? editingCustomer.name : ""}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Customer name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Sub Text
                </label>
                <input
                  name="subText"
                  defaultValue={editingCustomer ? editingCustomer.subText : ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Additional info"
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Contact Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingCustomer ? editingCustomer.email : ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Phone
                </label>
                <input
                  name="phone"
                  defaultValue={editingCustomer ? editingCustomer.phone : ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Phone number"
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
                {editingCustomer ? "Update Customer" : "Create Customer"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}