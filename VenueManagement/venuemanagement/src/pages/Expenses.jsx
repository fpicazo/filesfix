import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'

export default function ExpensePage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expensesList, setExpensesList] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [eventsList, setEventsList] = useState([])
  
  const [formData, setFormData] = useState({
    expenseNumber: "",
    date: "",
    category: "",
    amount: "",
    description: "",
    eventId: "",
    type: "",
  })

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await http.get('/api/expenses')
        console.log("Fetched expenses:", data)
        setExpensesList(data)
      } catch (error) {
        console.error("Error fetching expenses:", error)
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
    
    fetchExpenses()
    fetchEvents()
  }, [])

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount)
    }
    
    if (editingExpense) {
      // Update existing expense in local state
      setExpensesList(prev =>
        prev.map(expense =>
          expense._id === formData._id ? { ...expense, ...submitData } : expense
        )
      )
      // Call API to update the expense
      try {
        await http.put(`/api/expenses/${formData._id}`, submitData)
      } catch (error) {
        console.error("Error updating expense:", error)
      }
    } else {
      // Call API to add the expense first to get the complete object
      try {
        const { data: newExpense } = await http.post('/api/expenses', submitData)
        // Add new expense with server response to local state
        setExpensesList(prev => [...prev, newExpense])
      } catch (error) {
        console.error("Error adding expense:", error)
      }
    }

    closeDrawer()
  }

  const deleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      // Update local state using _id
      setExpensesList(prev => prev.filter(expense => expense._id !== id))
      try {
        await http.delete(`/api/expenses/${id}`)
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  const openDrawer = (expense = null) => {
    setEditingExpense(expense)
    if (expense) {
      setFormData({
        ...expense,
        amount: expense.amount.toString(),
        date: expense.date ? expense.date.split('T')[0] : "",
        eventId: expense.eventId || ""
      })
    } else {
      setFormData({
        expenseNumber: "",
        date: "",
        category: "",
        amount: "",
        description: "",
        eventId: "",
        type: "",
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingExpense(null)
    setFormData({
      expenseNumber: "",
      date: "",
      category: "",
      amount: "",
      description: "",
      eventId: "",
      type: "",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Expense #",
      accessorKey: "expenseNumber",
      cell: (props) => (
        <p className="text-gray-800 font-medium">{props.getValue()}</p>
      )
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (props) => (
        <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Category",
      accessorKey: "category",
      meta: { filterVariant: "select", defaultLabel: "All Categories" },
      cell: (props) => (
        <p className="text-gray-800">{props.getValue()}</p>
      )
    },
    {
      header: "Type",
      accessorKey: "type",
      meta: { filterVariant: "select", defaultLabel: "All Types" },
      cell: (props) => (
        <p className="text-gray-800">{props.getValue()}</p>
      )
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (props) => (
        <p className="text-gray-800 font-medium">${props.getValue()?.toFixed(2)}</p>
      )
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (props) => (
        <p className="text-gray-800 truncate max-w-xs">{props.getValue() || '-'}</p>
      )
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Expense"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteExpense(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Expense"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Expenses" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={expensesList}
              columns={columns}
              dataNotFoundQuery="No expenses found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Expense
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Expense */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingExpense ? "Edit Expense" : "New Expense"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Expense Number
                  </label>
                  <input
                    type="text"
                    name="expenseNumber"
                    value={formData.expenseNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="EXP-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Date
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Photography">Photography</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Variable">Variable</option>
                    <option value="One-time">One-time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
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
                  placeholder="Describe the expense details..."
                />
              </div>
            </div>

            {/* Related Event Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Related Event
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Event (Optional)
                </label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No Event Selected</option>
                  {eventsList.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name} - {formatDateToDMY(event.date)}
                    </option>
                  ))}
                </select>
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
                {editingExpense ? "Update Expense" : "Create Expense"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}