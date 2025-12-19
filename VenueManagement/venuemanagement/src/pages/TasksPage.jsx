import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'

export default function TasksPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tasksList, setTasksList] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [eventsList, setEventsList] = useState([])
  const [customersList, setCustomersList] = useState([])
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    description: "",
    status: "Pending",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
    subject: "",
    type: "",
    eventId: "",
    customerId: "",
  })

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log("Starting to fetch all data...")
        
        // Fetch all data in parallel
        const [tasksRes, eventsRes, customersRes, usersRes] = await Promise.allSettled([
          http.get('/api/tasks'),
          http.get('/api/events'),
          http.get('/api/customers'),
          http.get('/api/users')
        ])

        // Handle tasks
        if (tasksRes.status === 'fulfilled') {
          console.log("Fetched tasks:", tasksRes.value.data)
          setTasksList(Array.isArray(tasksRes.value.data) ? tasksRes.value.data : [])
        } else {
          console.error("Error fetching tasks:", tasksRes.reason)
          setTasksList([])
        }

        // Handle events
        if (eventsRes.status === 'fulfilled') {
          console.log("Fetched events:", eventsRes.value.data)
          setEventsList(Array.isArray(eventsRes.value.data) ? eventsRes.value.data : [])
        } else {
          console.error("Error fetching events:", eventsRes.reason)
          setEventsList([])
        }

        // Handle customers
        if (customersRes.status === 'fulfilled') {
          console.log("Fetched customers:", customersRes.value.data)
          setCustomersList(Array.isArray(customersRes.value.data) ? customersRes.value.data : [])
        } else {
          console.error("Error fetching customers:", customersRes.reason)
          setCustomersList([])
        }

        // Handle users
        if (usersRes.status === 'fulfilled') {
          console.log("Fetched users:", usersRes.value.data)
          setUsersList(Array.isArray(usersRes.value.data) ? usersRes.value.data : [])
        } else {
          console.error("Error fetching users:", usersRes.reason)
          setUsersList([])
        }

      } catch (error) {
        console.error("Error in fetchAllData:", error)
        setError(error.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
      }
      
      if (editingTask) {
        // Update existing task in local state
        setTasksList(prev =>
          prev.map(task =>
            task._id === formData._id ? { ...task, ...submitData } : task
          )
        )
        // Call API to update the task
        try {
          await http.put(`/api/tasks/${formData._id}`, submitData)
          console.log("Task updated successfully")
        } catch (error) {
          console.error("Error updating task:", error)
          alert("Failed to update task: " + (error.response?.data?.message || error.message))
          // Revert local state on error
          const oldTask = tasksList.find(t => t._id === formData._id)
          if (oldTask) {
            setTasksList(prev =>
              prev.map(task =>
                task._id === formData._id ? oldTask : task
              )
            )
          }
        }
      } else {
        // Call API to add the task first to get the complete object
        try {
          const { data: newTask } = await http.post('/api/tasks', submitData)
          // Add new task with server response to local state
          setTasksList(prev => [...prev, newTask])
          console.log("Task created successfully")
        } catch (error) {
          console.error("Error adding task:", error)
          alert("Failed to create task: " + (error.response?.data?.message || error.message))
        }
      }

      closeDrawer()
    } catch (error) {
      console.error("Unexpected error in form submission:", error)
      alert("An unexpected error occurred")
    }
  }

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasksList.find(task => task._id === id)
      
      // Update local state using _id
      setTasksList(prev => prev.filter(task => task._id !== id))
      try {
        await http.delete(`/api/tasks/${id}`)
        console.log("Task deleted successfully")
      } catch (error) {
        console.error("Error deleting task:", error)
        alert("Failed to delete task: " + (error.response?.data?.message || error.message))
        // Revert local state on error
        if (taskToDelete) {
          setTasksList(prev => [...prev, taskToDelete])
        }
      }
    }
  }

  const openDrawer = (task = null) => {
    setEditingTask(task)
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
        eventId: task.eventId || "",
        customerId: task.customerId || "",
        assignedTo: task.assignedTo || ""
      })
    } else {
      setFormData({
        name: "",
        description: "",
        status: "Pending",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
        subject: "",
        type: "",
        eventId: "",
        customerId: "",
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingTask(null)
    setFormData({
      name: "",
      description: "",
      status: "Pending",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
      subject: "",
      type: "",
      eventId: "",
      customerId: "",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Get user name from ID
  const getUserName = (userId) => {
    const user = usersList.find(u => u._id === userId)
    return user ? user.name : userId
  }

  // Get customer name from ID
  const getCustomerName = (customerId) => {
    const customer = customersList.find(c => c._id === customerId)
    return customer ? customer.name : customerId
  }

  // Get event name from ID
  const getEventName = (eventId) => {
    const event = eventsList.find(e => e._id === eventId)
    return event ? event.name : eventId
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-gray-100 text-gray-800'
      case 'On Hold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Subject",
      accessorKey: "subject",
      cell: (props) => (
        <p className="text-gray-800 font-medium">{props.getValue()}</p>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: (props) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(props.getValue())}`}>
          {props.getValue()}
        </span>
      )
    },
    {
      header: "Priority",
      accessorKey: "priority",
      meta: { filterVariant: "select", defaultLabel: "All Priorities" },
      cell: (props) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(props.getValue())}`}>
          {props.getValue()?.charAt(0).toUpperCase() + props.getValue()?.slice(1)}
        </span>
      )
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (props) => (
        <p className="text-gray-800">{props.getValue() ? formatDateToDMY(props.getValue()) : '-'}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Assigned To",
      accessorKey: "assignedTo",
      meta: { filterVariant: "select", defaultLabel: "All Users" },
      cell: (props) => (
        <p className="text-gray-800">{props.getValue() ? getUserName(props.getValue()) : '-'}</p>
      )
    },
    {
      header: "Customer",
      accessorKey: "customerId",
      cell: (props) => (
        <p className="text-gray-800 truncate max-w-xs">{props.getValue() ? getCustomerName(props.getValue()) : '-'}</p>
      )
    },
    {
      header: "Event",
      accessorKey: "eventId",
      cell: (props) => (
        <p className="text-gray-800 truncate max-w-xs">{props.getValue() ? getEventName(props.getValue()) : '-'}</p>
      )
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-gray-50"
            title="Edit Task"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteTask(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-red-50"
            title="Delete Task"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <PageHeader title="Tasks" backPath="/">
        <div className="min-h-screen bg-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </PageHeader>
    )
  }

  if (error) {
    return (
      <PageHeader title="Tasks" backPath="/">
        <div className="min-h-screen bg-purple-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Tasks</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">Check the browser console for more details.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </PageHeader>
    )
  }

  return (
    <PageHeader title="Tasks" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={tasksList}
              columns={columns}
              dataNotFoundQuery="No tasks found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Task
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Task */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingTask ? "Edit Task" : "New Task"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
             
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter task subject"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Setup, Coordination, Follow-up"
                />
              </div>
            </div>

            {/* Related Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Related Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select User</option>
                  {usersList.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Customer
                </label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
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
                  Event
                </label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Event</option>
                  {eventsList.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name} - {formatDateToDMY(event.date)}
                    </option>
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
                  placeholder="Enter task description..."
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
                {editingTask ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}