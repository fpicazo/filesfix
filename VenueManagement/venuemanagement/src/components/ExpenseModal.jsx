import React from 'react'
import { X } from 'lucide-react'
import { Save, FileText } from 'lucide-react'

const categoryList = [
  "Comida",
  "Travel",
  "Accommodation",
  "Entertainment",
  "Miscellaneous",
]

function formatDateForInput(isoString) {
  if (!isoString) return ""
  return isoString.split("T")[0]
}

export default function ExpenseModal({ editingExpense, onClose, onSubmit,eventsList, formData, setFormData }) {

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
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-2">
          {/* Column 1 */}
          <div>
            <label className="text-xs font-medium">Expense #</label>
            <input
              name="expenseNumber"
              type="text"
              onChange={handleChange}
              value={formData.expenseNumber}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>
          <div>

            <label className="text-xs font-medium">Event</label>
            <select
              name="eventId"
              onChange={handleChange}
              value={formData.eventId}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="" disabled>Select an event</option>
              {eventsList.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>

          </div>
          <div>
            <label className="text-xs font-medium">Date</label>
            <input
              name="date"
              type="date"
              onChange={handleChange}
              value={formatDateForInput(formData.date)}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Category</label>
            <select
              name="category"
              
              onChange={handleChange}
              value={formData.category}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="" disabled>Select a category</option>
              {categoryList.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Amount</label>
            <input
              name="amount"
              type="number"
              onChange={handleChange}
              value={formData.amount}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium">Description</label>
            <textarea
              name="description"
              onChange={handleChange}
              value={formData.description}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
              rows="3"
            />
          </div>

          {/* Full-width buttons */}
          <div className="col-span-2 flex gap-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-md text-xs font-medium"
            >
              <Save className="h-5 w-5" />
              Save
            </button>
            
          </div>
        </form>
      </div>
    </div>
  )
}
