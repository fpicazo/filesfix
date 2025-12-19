import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import handleGenerateDocument from '../components/DocumentGenerator'
import { Save, FileText } from 'lucide-react'

const statusOptions = ['Pendiente', 'Mandar cotización', 'Vendido', 'Planeado', 'Pago retrasado', 'Vencido', 'Cancelado']
const eventTypeOptions = ['Bautizo', 'Boda', 'Fiesta', 'Bithday']
const placeOptions = ['Jardín', 'Salón']

export default function QuoteModal({ editingQuote, onClose, onSubmit, customersList, formData, setFormData }) {
  const [quoteStatus, setQuoteStatus] = useState(formData?.status || "prospecto")

  useEffect(() => {
    setQuoteStatus(formData?.status || "prospecto")
  
    // Fix: Ensure customerId is just the ID string
    if (formData?.customerId && typeof formData.customerId === "object") {
      setFormData(prev => ({
        ...prev,
        customerId: formData.customerId._id
      }))
    }
  }, [formData?.status, formData?.customerId])
  const showFinancialFields = !["mandar cotizacion", "prospecto"].includes(quoteStatus.toLowerCase())

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "status") setQuoteStatus(value)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-xl bg-white shadow-lg h-full p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingQuote ? "Edit Quote" : "Add New Quote"}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Amount</label>
            <input
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          {showFinancialFields && (
            <div>
              <label className="text-xs font-medium">Cost</label>
              <input
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium">Guests</label>
            <input
              name="guests"
              type="number"
              value={formData.guests}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Customer</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              <option value="">Select Customer</option>
              {customersList.map(customer => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Time</label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Quote Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Event Type</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              {eventTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Sillas Type</label>
            <input
              name="sillasType"
              value={formData.sillasType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Mantel Type</label>
            <input
              name="mantelType"
              value={formData.mantelType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Place</label>
            <select
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            >
              {placeOptions.map(place => (
                <option key={place} value={place}>{place}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Type of Food</label>
            <input
              name="typeOfFood"
              value={formData.typeOfFood}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 text-xs"
            />
          </div>

          <div className="col-span-2 flex gap-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-md font-medium text-xs"
            >
              <Save className="h-5 w-5" />
              Save
            </button>
            <button
              onClick={() => handleGenerateDocument(editingQuote?.id)}
              type="button"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-md font-medium text-xs"
            >
              <FileText className="h-5 w-5" />
              Generate Document
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
