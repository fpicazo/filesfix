import React, { useEffect, useMemo, useState } from "react"
import DrawerWrapper from "./DrawerWrapper"
import FileImport from "./shared/FileList"
import http from "../config/http"

export default function PaymentDrawer({
  open,
  onClose,
  editingPayment,
  customersList,
  onSaved, // (savedPayment, mode) => void  mode: 'create' | 'update'
}) {
  const [customerInvoices, setCustomerInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const [formData, setFormData] = useState({
    serie: "",
    paymentNumber: "",
    customerId: "",
    invoiceId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amountToPay: "",
    type: "Payment",
    paymentMethod: "",
    reference: "",
    notes: "",
    balanceBefore: null,
    balanceAfter: null,
    _id: undefined,
    related: undefined,
  })

  // Fetch invoices for a customer
  const handleCustomerChange = async (customerId, keepInvoiceSelection = false) => {
    if (!keepInvoiceSelection) {
      setFormData((prev) => ({
        ...prev,
        customerId,
        invoiceId: "",
        amountToPay: "",
      }))
      setSelectedInvoice(null)
    } else {
      setFormData((prev) => ({ ...prev, customerId }))
    }

    setCustomerInvoices([])

    if (!customerId) return

    try {
      const { data } = await http.get(`/api/invoices?customerId=${customerId}`)
      const invoices = keepInvoiceSelection
        ? data
        : data.filter((inv) => inv.status === "pending" || inv.status === "partial")
      
      console.log("Fetched invoices for customer:", invoices)
        setCustomerInvoices(invoices)
    } catch (err) {
      console.error("Error fetching customer invoices:", err)
      setCustomerInvoices([])
    }
  }

  const handleInvoiceChange = (invoiceId) => {
    const invoice = customerInvoices.find((inv) => inv._id === invoiceId)
    setSelectedInvoice(invoice || null)
    setFormData((prev) => ({
      ...prev,
      invoiceId,
      amountToPay: invoice && invoice.remainingBalance != null ? invoice.remainingBalance.toString() : "",
    }))
  }

  const getBalanceBefore = () => {
    if (editingPayment && formData.balanceBefore !== null) return formData.balanceBefore
    return selectedInvoice?.remainingBalance || 0
  }

  const getBalanceAfter = () => {
    if (editingPayment && formData.balanceAfter !== null) return formData.balanceAfter
    const before = getBalanceBefore()
    const paid = parseFloat(formData.amountToPay) || 0
    return Math.max(0, before - paid)
  }

  const resetState = () => {
    setCustomerInvoices([])
    setSelectedInvoice(null)
    setFormData({
      serie: "",
      paymentNumber: "",
      customerId: "",
      invoiceId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      amountToPay: "",
      type: "Payment",
      paymentMethod: "",
      reference: "",
      notes: "",
      balanceBefore: null,
      balanceAfter: null,
      _id: undefined,
      related: undefined,
    })
  }

  // When drawer opens, initialize form (new vs edit)
  useEffect(() => {
    if (!open) return

    const init = async () => {
      if (editingPayment) {
        const paymentDate = editingPayment.paymentDate || editingPayment.date
          ? (editingPayment.paymentDate || editingPayment.date).split("T")[0]
          : new Date().toISOString().split("T")[0]

        const customerId = editingPayment.invoiceId?.customerId?._id || editingPayment.customerId
        const invoiceId = editingPayment.invoiceId?._id

        // Pre-select invoice (even before invoices list loads)
        if (editingPayment.invoiceId) {
          setSelectedInvoice({
            remainingBalance: editingPayment.invoiceId?.remainingBalance ?? 0,
            ...editingPayment.invoiceId,
          })
        }

        if (customerId) {
          await handleCustomerChange(customerId, true)
        }

        setFormData({
          serie: editingPayment.serie || "",
          paymentNumber: editingPayment.paymentNumber || "",
          customerId: customerId || "",
          invoiceId: invoiceId || "",
          paymentDate,
          amountToPay: editingPayment.amount?.toString() || "",
          type: editingPayment.type || "Payment",
          paymentMethod: editingPayment.method || "",
          reference: editingPayment.reference || "",
          notes: editingPayment.notes || "",
          balanceBefore: editingPayment.balanceBefore ?? null,
          balanceAfter: editingPayment.balanceAfter ?? null,
          _id: editingPayment._id,
          related: editingPayment.related,
        })
      } else {
        // New payment: generate number
        resetState()
        try {
          const { data } = await http.post("/api/payments/generate-number")
          setFormData((prev) => ({
            ...prev,
            serie: data.serie || "",
            paymentNumber: data.paymentNumber || "",
          }))
        } catch (err) {
          console.error("Error generating payment number:", err)
        }
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingPayment?._id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      serie: formData.serie,
      paymentNumber: formData.paymentNumber,
      customerId: formData.customerId,
      invoiceId: formData.invoiceId,
      date: formData.paymentDate,
      amount: parseFloat(formData.amountToPay),
      type: formData.type,
      method: formData.paymentMethod,
      reference: formData.reference,
      notes: formData.notes,
      balanceBefore: getBalanceBefore(),
      balanceAfter: getBalanceAfter(),
    }

    try {
      if (editingPayment) {
        await http.put(`/api/payments/${editingPayment._id}`, payload)
        onSaved?.({ ...editingPayment, ...payload }, "update")
      } else {
        const { data: created } = await http.post("/api/payments", payload)
        onSaved?.(created, "create")
      }
      onClose?.()
      resetState()
    } catch (err) {
      console.error("Error saving payment:", err)
    }
  }

  const title = useMemo(() => (editingPayment ? "Edit Payment" : "New Payment"), [editingPayment])

  return (
    <DrawerWrapper open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Number Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Payment Number
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Serie
              </label>
              <input
                type="text"
                name="serie"
                value={formData.serie}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="PAY"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Payment Number
              </label>
              <input
                type="text"
                name="paymentNumber"
                value={formData.paymentNumber}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="001"
              />
            </div>
          </div>
        </div>

        {/* Customer and Invoice Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Customer & Invoice
          </h3>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Customer
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Customer</option>
              {customersList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Invoice
            </label>
            <select
              name="invoiceId"
              value={formData.invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              required
              disabled={!formData.customerId}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Invoice</option>
              {customerInvoices.map((inv) => (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceNumber} - Balance: ${inv.remainingBalance}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Payment Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Payment Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Payment">Payment</option>
                <option value="Partial">Partial</option>
                <option value="Deposit">Deposit</option>
                <option value="Refund">Refund</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="PayPal">PayPal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Reference Number
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Transaction reference or check number"
            />
          </div>
        </div>

        {/* Amount Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Amount Information
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Balance Before
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700 font-medium">
                ${getBalanceBefore().toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Monto Pagado
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="amountToPay"
                  value={formData.amountToPay}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={getBalanceBefore()}
                  step="0.01"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Balance After
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-green-50 text-green-700 font-medium">
                ${getBalanceAfter().toFixed(2)}
              </div>
            </div>
          </div>

          {editingPayment && formData.balanceBefore !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
              <p className="text-blue-800 font-medium mb-1">Payment Record</p>
              <p className="text-blue-700">
                This payment reduced the balance from ${formData.balanceBefore.toFixed(2)} to $
                {formData.balanceAfter.toFixed(2)}
              </p>
            </div>
          )}
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
              rows="3"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Payment notes or additional details..."
            />
          </div>
        </div>

        <FileImport module="payments" parentId={formData._id} files={formData?.related?.attachments} />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              onClose?.()
              resetState()
            }}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            {editingPayment ? "Update Payment" : "Record Payment"}
          </button>
        </div>
      </form>
    </DrawerWrapper>
  )
}
