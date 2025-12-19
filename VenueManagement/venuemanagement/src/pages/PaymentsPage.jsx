import React, { useState, useEffect } from "react"
import { Plus, Pencil, Trash } from "lucide-react"
import PageHeader from "../components/PageHeader"
import { CustomTable } from "../components/Table/CustomTable"
import http from "../config/http"
import { formatDateToDMY } from "../utils/formatDate"
import PaymentDrawer from "../components/PaymentDrawer"

export default function PaymentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paymentsList, setPaymentsList] = useState([])
  const [editingPayment, setEditingPayment] = useState(null)
  const [customersList, setCustomersList] = useState([])

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await http.get("/api/payments")
        setPaymentsList(data)
      } catch (error) {
        console.error("Error fetching payments:", error)
      }
    }

    const fetchCustomers = async () => {
      try {
        const { data } = await http.get("/api/customers")
        setCustomersList(data)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }

    fetchPayments()
    fetchCustomers()
  }, [])

  const openDrawer = (payment = null) => {
    setEditingPayment(payment)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingPayment(null)
  }

  const deletePayment = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      setPaymentsList((prev) => prev.filter((p) => p._id !== id))
      try {
        await http.delete(`/api/payments/${id}`)
      } catch (error) {
        console.error("Error deleting payment:", error)
      }
    }
  }

  const getPaymentMethodBadge = (method) => {
    const methodColors = {
      Cash: "bg-green-100 text-green-800",
      "Credit Card": "bg-blue-100 text-blue-800",
      "Bank Transfer": "bg-purple-100 text-purple-800",
      Check: "bg-yellow-100 text-yellow-800",
      PayPal: "bg-indigo-100 text-indigo-800",
      Other: "bg-gray-100 text-gray-800",
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          methodColors[method] || "bg-gray-100 text-gray-800"
        }`}
      >
        {method}
      </span>
    )
  }

  const columns = [
    {
      header: "Payment Number",
      accessorKey: "paymentNumber",
      cell: ({ row }) => (
        <p className="text-gray-800 font-medium">
          {row.original.serie
            ? `${row.original.serie}-${row.original.paymentNumber}`
            : row.original.paymentNumber || "N/A"}
        </p>
      ),
    },
    {
      header: "Payment Date",
      accessorKey: "date",
      cell: (props) => <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>,
      filterFn: "dateFilter",
      meta: { filterVariant: "date" },
    },
    {
      header: "Customer",
      accessorKey: "invoiceId.customerId.name",
      cell: ({ row }) => (
        <p className="text-gray-800 font-medium">{row.original.invoiceId?.customerId?.name || "Unknown Customer"}</p>
      ),
    },
    {
      header: "Invoice",
      accessorKey: "invoiceId.invoiceNumber",
      cell: (props) => <p className="text-gray-800">{props.getValue() || "N/A"}</p>,
    },
    {
      header: "Balance Before",
      accessorKey: "balanceBefore",
      cell: ({ row }) => <p className="text-gray-600 text-sm">${row.original.balanceBefore?.toFixed(2) ?? "N/A"}</p>,
    },
    {
      header: "Amount Paid",
      accessorKey: "amount",
      cell: ({ row }) => <p className="text-gray-800 font-semibold">${row.original.amount?.toFixed(2)}</p>,
    },
    {
      header: "Balance After",
      accessorKey: "balanceAfter",
      cell: ({ row }) => <p className="text-gray-600 text-sm font-medium">${row.original.balanceAfter?.toFixed(2) ?? "N/A"}</p>,
    },
    {
      header: "Method",
      accessorKey: "method",
      meta: { filterVariant: "select", defaultLabel: "All Methods" },
      cell: ({ row }) => getPaymentMethodBadge(row.original.method),
    },
    {
      header: "Reference",
      accessorKey: "reference",
      cell: (props) => <p className="text-gray-600">{props.getValue() || "-"}</p>,
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Payment"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deletePayment(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Payment"
          >
            <Trash size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageHeader title="Payments" backPath="/">
      <div className="min-h-screen bg-purple-50">
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={paymentsList}
              columns={columns}
              dataNotFoundQuery="No payments found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Payment
                </button>
              }
            />
          </div>
        </div>

        <PaymentDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          editingPayment={editingPayment}
          customersList={customersList}
          onSaved={(saved, mode) => {
            if (mode === "update") {
              setPaymentsList((prev) => prev.map((p) => (p._id === saved._id ? saved : p)))
            } else {
              setPaymentsList((prev) => [...prev, saved])
            }
          }}
        />
      </div>
    </PageHeader>
  )
}
