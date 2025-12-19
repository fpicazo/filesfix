import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, FileText, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import { CustomTable } from '../components/Table/CustomTable'
import RightIcon from '../assets/helperIcons/RightIcon'
import http from '../config/http'

export default function QuotesPage() {
  // State variables
  const [quotesList, setQuotesList] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await http.get('/api/quotes')
      console.log("Fetched quotes:", response.data)
      setQuotesList(response.data)
    } catch (error) {
      console.error("Error fetching quotes:", error)
    }
  }

  const deleteQuote = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await http.delete(`/api/quotes/${id}`)
        // Refresh the list after deletion
        setQuotesList(prev => prev.filter(quote => quote._id !== id))
      } catch (error) {
        console.error("Error deleting quote:", error)
        alert("Error deleting quote")
      }
    }
  }

  const handleViewDetails = (quoteId) => {
    navigate(`/quotes/${quoteId}`)
  }

  const handleEdit = (quoteId) => {
    navigate(`/quotes/${quoteId}`)
  }

  const handleCreateNew = () => {
    navigate('/quotes/new')
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-orange-100 text-orange-800',
      'prospecto': 'bg-yellow-100 text-yellow-800',
      'pendiente': 'bg-blue-100 text-blue-800',
      'aprobado': 'bg-green-100 text-green-800',
      'rechazado': 'bg-red-100 text-red-800',
      'vencido': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Quote #",
      accessorKey: "quoteNumber",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-gray-800 font-medium">{row.original.quoteNumber}</p>
        </div>
      )
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: ({ row }) => (
        <p className="text-gray-800">
          {row.original.customerName || row.original.customerId?.name || '-'}
        </p>
      )
    },
    {
      header: "Quote Date",
      accessorKey: "quoteDate",
      cell: (props) => (
        <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Valid Until",
      accessorKey: "expiryDate",
      cell: (props) => (
        <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: ({ row }) => {
        const total = row.original.total || 0
        return (
          <p className="text-gray-800 font-semibold">
            ${total.toFixed(2)}
          </p>
        )
      }
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            title="View Details"
          >
            <Eye size={14} />
            Details
          </button>
          <button
            onClick={() => handleEdit(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            title="Edit Quote"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteQuote(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
            title="Delete Quote"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Quotes" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={quotesList}
              columns={columns}
              dataNotFoundQuery="No quotes found"
              additionalActions={
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium text-sm shadow transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create New Quote
                </button>
              }
            />
          </div>
        </div>
      </div>
    </PageHeader>
  )
}