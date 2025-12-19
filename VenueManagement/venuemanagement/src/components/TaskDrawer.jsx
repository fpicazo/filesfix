import React from 'react'
import { X } from 'lucide-react'
import { Save } from 'lucide-react'

function formatDateForInput(isoString) {
  if (!isoString) return ""
  return isoString.split("T")[0]
}

export default function TaskDrawer({ 
  editingTask, 
  onClose, 
  onSubmit,
  eventsList,
  customersList,
  usersList,
  formData, 
  setFormData 
}) {

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-xl bg-white shadow-lg h-full p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingTask ? "Edit Task" : "Add New Task"}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          
          {/* Task Name - Full Width */}
          <div className="col-span-2">
            <label className="text-xs font-medium">Task Name *</label>
            <input
              name="name"
              type="text"
              onChange={handleChange}
              value={formData.name}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
              placeholder="Enter task name"
            />
          </div>

          {/* Subject */}
          <div className="col-span-2">
            <label className="text-xs font-medium">Subject</label>
            <input
              name="subject"
              type="text"
              onChange={handleChange}
              value={formData.subject}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
              placeholder="Enter subject"
            />
          </div>

          {/* Status and Priority */}
          <div>
            <label className="text-xs font-medium">Status</label>
            <select
              name="status"
              onChange={handleChange}
              value={formData.status}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Priority</label>
            <select
              name="priority"
              onChange={handleChange}
              value={formData.priority}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date and Type */}
          <div>
            <label className="text-xs font-medium">Due Date</label>
            <input
              name="dueDate"
              type="date"
              onChange={handleChange}
              value={formatDateForInput(formData.dueDate)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Type</label>
            <input
              name="type"
              type="text"
              onChange={handleChange}
              value={formData.type}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
              placeholder="e.g., Setup, Coordination"
            />
          </div>

          {/* Assigned To */}
          <div>
            <label className="text-xs font-medium">Assigned To</label>
            <select
              name="assignedTo"
              onChange={handleChange}
              value={formData.assignedTo}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="">Select User</option>
              {usersList && usersList.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div>
            <label className="text-xs font-medium">Customer</label>
            <select
              name="customerId"
              onChange={handleChange}
              value={formData.customerId}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="">Select Customer</option>
              {customersList && customersList.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event */}
          <div>
            <label className="text-xs font-medium">Event</label>
            <select
              name="eventId"
              onChange={handleChange}
              value={formData.eventId}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="">Select Event</option>
              {eventsList && eventsList.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description - Full Width */}
          <div className="col-span-2">
            <label className="text-xs font-medium">Description</label>
            <textarea
              name="description"
              onChange={handleChange}
              value={formData.description}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
              rows="4"
              placeholder="Enter task description"
            />
          </div>

          {/* Full-width buttons */}
          <div className="col-span-2 flex gap-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-md text-xs font-medium"
            >
              <Save className="h-4 w-4" />
              {editingTask ? "Update Task" : "Save Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 w-full py-2 rounded-md text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}