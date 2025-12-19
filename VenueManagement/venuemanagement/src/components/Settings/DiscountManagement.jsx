import React, { useState, useEffect } from 'react'
import { Plus, Percent, Pencil, Trash, Tag } from 'lucide-react'
import http from '../../config/http'
import DrawerWrapper from '../DrawerWrapper'
import { CustomTable } from '../Table/CustomTable'

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    discount: '',
    description: '',
  })

  // Fixed price for all discounts
  const FIXED_PRICE = 1000

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const { data } = await http.get('/api/discounts')
        setDiscounts(data)
      } catch (error) {
        console.error('Error fetching discounts:', error)
      }
    }
    fetchDiscounts()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const calculateDiscountedPrice = (price, discount) => {
    const discountedAmount = price - (price * discount / 100)
    return discountedAmount
  }

  const getDiscountBadge = (discount) => {
    let colorClass = 'bg-gray-100 text-gray-800'
    
    if (discount >= 50) {
      colorClass = 'bg-red-100 text-red-800'
    } else if (discount >= 25) {
      colorClass = 'bg-orange-100 text-orange-800'
    } else if (discount >= 10) {
      colorClass = 'bg-yellow-100 text-yellow-800'
    } else if (discount > 0) {
      colorClass = 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {discount}% OFF
      </span>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submissionData = {
      ...formData,
      price: FIXED_PRICE,
      discount: parseFloat(formData.discount),
    }

    if (editingDiscount) {
      try {
        await http.put(`/api/discounts/${formData._id}`, submissionData)
        setDiscounts(prev => prev.map(d => (d._id === formData._id ? { ...formData, ...submissionData } : d)))
      } catch (error) {
        console.error('Error updating discount:', error)
      }
    } else {
      try {
        const { data } = await http.post('/api/discounts', submissionData)
        setDiscounts(prev => [...prev, data])
      } catch (error) {
        console.error('Error creating discount:', error)
      }
    }

    setDrawerOpen(false)
    setEditingDiscount(null)
    setFormData({ 
      name: '', 
      discount: '', 
      description: '' 
    })
  }

  const deleteDiscount = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await http.delete(`/api/discounts/${id}`)
        setDiscounts(prev => prev.filter(d => d._id !== id))
      } catch (error) {
        console.error('Error deleting discount:', error)
      }
    }
  }

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      ...discount,
      discount: discount.discount.toString()
    })
    setDrawerOpen(true)
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Discount Name",
      accessorKey: "name",
      cell: ({ row }) => {
        const discount = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{discount.name}</div>
              {discount.description && (
                <div className="text-xs text-gray-500">{discount.description}</div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "Discount",
      accessorKey: "discount",
      cell: ({ row }) => getDiscountBadge(row.original.discount),
      meta: {
        filterVariant: "range",
        defaultLabel: "All Discounts"
      }
    },
    {
      header: "Final Price",
      accessorKey: "finalPrice",
      cell: ({ row }) => {
        const finalPrice = calculateDiscountedPrice(FIXED_PRICE, row.original.discount)
        const savings = FIXED_PRICE - finalPrice
        return (
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(finalPrice)}
            </div>
            <div className="text-xs text-green-600">
              Save {formatCurrency(savings)}
            </div>
          </div>
        )
      }
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditDiscount(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Discount"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteDiscount(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Discount"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  // Calculate stats
  const totalDiscounts = discounts.length
  const averageDiscount = discounts.length > 0 
    ? (discounts.reduce((sum, d) => sum + d.discount, 0) / discounts.length).toFixed(1)
    : 0
  const totalSavings = discounts.reduce((sum, d) => 
    sum + (FIXED_PRICE - calculateDiscountedPrice(FIXED_PRICE, d.discount)), 0)
  const highestDiscount = discounts.length > 0 
    ? Math.max(...discounts.map(d => d.discount))
    : 0

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Discount Management</h2>
          <p className="text-gray-600 mt-1">Manage your discount offers and pricing</p>
        </div>

        {/* Stats Cards */}
        <div className="flex items-center gap-4 flex-wrap mb-6">
          {/* Total Discounts Card */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
            <div className="text-2xl font-bold text-gray-900">{totalDiscounts}</div>
            <div className="text-sm text-gray-600">Total Discounts</div>
          </div>
          
          {/* Average Discount Card */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
            <div className="text-2xl font-bold text-blue-600">{averageDiscount}%</div>
            <div className="text-sm text-gray-600">Average Discount</div>
          </div>
          
          {/* Total Savings Card */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</div>
            <div className="text-sm text-gray-600">Total Savings</div>
          </div>
          
          {/* Highest Discount Card */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
            <div className="text-2xl font-bold text-purple-600">{highestDiscount}%</div>
            <div className="text-sm text-gray-600">Highest Discount</div>
          </div>
        </div>
      </div>

      {/* Main Content Card with CustomTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CustomTable
          data={discounts}
          columns={columns}
          dataNotFoundQuery="No discounts yet. Get started by adding your first discount offer."
          additionalActions={
            <button
              onClick={() => {
                setEditingDiscount(null)
                setFormData({ 
                  name: '', 
                  discount: '', 
                  description: '' 
                })
                setDrawerOpen(true)
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium text-sm shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Discount
            </button>
          }
        />
      </div>

      {/* Enhanced Drawer */}
      <DrawerWrapper
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditingDiscount(null)
        }}
        title={editingDiscount ? 'Edit Discount' : 'Add New Discount'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Discount Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter discount name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter discount description"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Discount Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            </div>

            {/* Price Preview */}
            {formData.discount && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Price Preview</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium">{formatCurrency(FIXED_PRICE)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount ({formData.discount}%):</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(FIXED_PRICE * (parseFloat(formData.discount) || 0) / 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-900 font-medium">Final Price:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(calculateDiscountedPrice(FIXED_PRICE, parseFloat(formData.discount) || 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Delete Section (only for editing) */}
          {editingDiscount && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">Permanently delete this discount and all associated data.</p>
              <button
                type="button"
                onClick={() => deleteDiscount(editingDiscount._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Discount
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex justify-between">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false)
                setEditingDiscount(null)
              }}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              {editingDiscount ? 'Save Changes' : 'Create Discount'}
            </button>
          </div>
        </form>
      </DrawerWrapper>
    </div>
  )
}