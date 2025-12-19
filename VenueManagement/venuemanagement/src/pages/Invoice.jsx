import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Delete, FileText, DollarSign, Pencil, Trash } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'
import { formatDateToDMY } from '../utils/formatDate'

export default function InvoicesPage() {
  // State variables
  const [invoiceList, setInvoiceList] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        
        // Get eventid from URL parameters
        const eventId = searchParams.get('eventid')
        
        // Build URL with eventId parameter if present
        const url = eventId ? `/api/invoices?eventid=${eventId}` : '/api/invoices'
        
        const response = await http.get(url)
        console.log("Fetched invoices:", response.data)
        setInvoiceList(response.data)
      } catch (error) {
        console.error("Error fetching invoices:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [searchParams])

  // Delete invoice handler
  const deleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoiceList(prev => prev.filter(invoice => invoice._id !== id))
      
      try {
        await http.delete(`/api/invoices/${id}`)
      } catch (error) {
        console.error("Error deleting invoice:", error)
      }
    }
  }

  // Navigate to edit invoice
  const handleEditInvoice = (id) => {
    navigate(`/invoices/${id}`)
  }

  // Navigate to new invoice
  const handleNewInvoice = () => {
    navigate('/invoices/new')
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusColors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'Draft'}
      </span>
    )
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  // Calculate totals
  const totalAmount = invoiceList.reduce((sum, inv) => sum + (inv.total || 0), 0)
  const paidInvoices = invoiceList.filter(inv => inv.status === 'paid')
  const pendingInvoices = invoiceList.filter(inv => inv.status === 'pending')
  const overdueInvoices = invoiceList.filter(inv => inv.status === 'overdue')
  const draftInvoices = invoiceList.filter(inv => inv.status === 'draft')

  // Define columns for CustomTable
  const columns = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-gray-800 font-medium">{invoice.serie}-{invoice.invoiceNumber}</p>
              {invoice.description && (
                <p className="text-xs text-gray-500">{invoice.description}</p>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div>
            <p className="text-gray-800 font-medium">{invoice.customerName}</p>
            {invoice.customerEmail && (
              <p className="text-xs text-gray-500">{invoice.customerEmail}</p>
            )}
          </div>
        )
      }
    },
    {
      header: "Issue Date",
      accessorKey: "invoiceDate",
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <span className={'text-gray-800'}>
            {invoice.invoiceDate ? formatDateToDMY(invoice.invoiceDate) : '-'}
          </span>
        )
      }
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: ({ row }) => {
        const invoice = row.original
        const isOverdue = invoice.dueDate && 
          new Date(invoice.dueDate) < new Date() && 
          invoice.status !== 'paid'
        
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-800'}>
            {invoice.dueDate ? formatDateToDMY(invoice.dueDate) : '-'}
          </span>
        )
      },
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Amount",
      accessorKey: "total",
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div>
            <span className="font-medium text-gray-900">
              {formatCurrency(invoice.total)}
            </span>
            {invoice.totalPaid && invoice.totalPaid > 0 && invoice.status !== 'paid' && (
              <p className="text-xs text-green-600">
                Paid: {formatCurrency(invoice.totalPaid)}
              </p>
            )}
          </div>
        )
      }
    },
    {
      header: "Remaining",
      accessorKey: "remainingBalance",
      cell: (props) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(props.getValue())}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditInvoice(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Invoice"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteInvoice(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Invoice"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <PageHeader title="Invoices" backPath="/">
        <div className="min-h-screen bg-purple-50 flex items-center justify-center">
          <div className="text-purple-600">Loading invoices...</div>
        </div>
      </PageHeader>
    )
  }

  return (
    <PageHeader title="Invoices" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            
            {/* Summary Header */}
            <div className="flex items-center justify-between mb-4 px-4 py-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-700 font-medium">
                  Total: <span className="text-purple-600">{invoiceList.length}</span> invoices
                </span>
                <span className="flex items-center gap-1 text-gray-700 font-medium">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-600">{formatCurrency(totalAmount)}</span>
                </span>
              </div>
            </div>

            {/* Table */}
            <CustomTable
              data={invoiceList}
              columns={columns}
              dataNotFoundQuery="No invoices yet. Create your first invoice!"
              additionalActions={
                <button
                  onClick={handleNewInvoice}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Factura
                </button>
              }
            />

            {/* Summary Footer */}
            {invoiceList.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-600 font-medium">Paid Invoices</p>
                    <p className="text-green-800">
                      {paidInvoices.length} invoices
                    </p>
                    <p className="text-green-900 font-semibold">
                      {formatCurrency(
                        paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-yellow-600 font-medium">Pending Invoices</p>
                    <p className="text-yellow-800">
                      {pendingInvoices.length} invoices
                    </p>
                    <p className="text-yellow-900 font-semibold">
                      {formatCurrency(
                        pendingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-600 font-medium">Overdue Invoices</p>
                    <p className="text-red-800">
                      {overdueInvoices.length} invoices
                    </p>
                    <p className="text-red-900 font-semibold">
                      {formatCurrency(
                        overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 font-medium">Draft Invoices</p>
                    <p className="text-gray-800">
                      {draftInvoices.length} invoices
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {formatCurrency(
                        draftInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageHeader>
  )
}