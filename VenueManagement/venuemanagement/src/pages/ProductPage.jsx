import React, { useState, useEffect, useRef } from 'react'
import { Plus, Package, Camera, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import ClaveProductSearch from '../components/shared/ClaveProductSearch'
import ClaveProdSearch from '../components/shared/ClaveProdSearch'
import http from '../config/http'
import uploadFileToS3 from '../utils/uploadFileToS3'

export default function ProductPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [productsList, setProductsList] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    sku: "",
    codigoSat: "",
    unidadSat: "",
    designa: "",
    imageUrl: "",
    status: "Available"
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await http.get('/api/products')
        console.log("Fetched products:", data)
        setProductsList(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    
    fetchProducts()
  }, [])

  // Image upload functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setImageError('')

    try {
      const imageUrl = await uploadFileToS3({
        file,
        module: 'products',
        recordId: editingProduct?._id || 'temp-' + Date.now(),
        tenantId: 'default',
        tipo: "product-image",
      })

      setFormData(prev => ({ ...prev, imageUrl }))
      console.log('Product image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      setImageError('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku && formData.sku.trim() ? formData.sku.trim() : null
    }
    
    if (editingProduct) {
      // Update existing product in local state
      setProductsList(prev =>
        prev.map(product =>
          product._id === formData._id ? { ...product, ...submitData } : product
        )
      )
      // Call API to update the product
      try {
        await http.put(`/api/products/${formData._id}`, submitData)
      } catch (error) {
        console.error("Error updating product:", error)
      }
    } else {
      // Call API to add the product first to get the complete object
      try {
        const { data: newProduct } = await http.post('/api/products', submitData)
        // Add new product with server response to local state
        setProductsList(prev => [...prev, newProduct])
      } catch (error) {
        console.error("Error adding product:", error)
      }
    }

    closeDrawer()
  }

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Update local state using _id
      setProductsList(prev => prev.filter(product => product._id !== id))
      try {
        await http.delete(`/api/products/${id}`)
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const openDrawer = (product = null) => {
    setEditingProduct(product)
    setImageError('')
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString(),
        stock: product.stock.toString(),
        sku: product.sku || ""
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "0",
        sku: "",
        codigoSat: "",
        unidadSat: "",
        designa: "",
        imageUrl: "",
        status: "Available"
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingProduct(null)
    setImageError('')
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "0",
      sku: "",
      codigoSat: "",
      unidadSat: "",
      designa: "",
      imageUrl: "",
      status: "Available"
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Available': 'bg-green-100 text-green-800',
      'Out of Stock': 'bg-red-100 text-red-800',
      'Discontinued': 'bg-gray-100 text-gray-800',
      'Limited': 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Product",
      accessorKey: "name",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-gray-800 font-medium">{product.name}</p>
              {product.description && (
                <p className="text-gray-500 text-xs truncate max-w-xs">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "SKU",
      accessorKey: "sku",
      cell: (props) => (
        <p className="text-gray-800 font-mono text-xs">
          {props.getValue() || '-'}
        </p>
      )
    },
    {
      header: "Category",
      accessorKey: "category",
      meta: { filterVariant: "select", defaultLabel: "All Categories" },
      cell: (props) => (
        <p className="text-gray-800">{props.getValue() || '-'}</p>
      )
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (props) => (
        <p className="text-gray-800 font-medium">${props.getValue()?.toFixed(2)}</p>
      )
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: (props) => {
        const stock = props.getValue()
        return (
          <p className={`text-sm font-medium text-center ${stock <= 0 ? 'text-red-600' : stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
            {stock}
          </p>
        )
      }
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
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Product"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteProduct(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Product"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Products" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={productsList}
              columns={columns}
              dataNotFoundQuery="No products found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Product
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Product - OPTIMIZED FOR COMPACT HEIGHT */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingProduct ? "Edit Product" : "New Product"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-3">
            {/* Product Image Section - Compact */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Image
              </h3>
              
              <div className="flex items-center gap-3">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Product"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Camera className="h-3 w-3" />
                    Upload
                  </button>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-gray-600 hover:text-gray-800 text-xs font-medium px-2 py-1.5"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              {imageError && (
                <p className="text-xs text-red-600">{imageError}</p>
              )}
            </div>

            {/* Basic Information - Grid Layout */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Basic Info
              </h3>
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Product name"
                />
              </div>

              {/* SKU and Category in one row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SKU"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Decorations">Decorations</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Audio/Visual">Audio/Visual</option>
                    <option value="Catering Supplies">Catering</option>
                    <option value="Linens">Linens</option>
                    <option value="Florals">Florals</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Price and Stock in one row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Price * (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-200 rounded pl-7 pr-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Limited">Limited</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* Mexican Invoicing Fields */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Mexican Invoicing (SAT)
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <ClaveProductSearch
                    value={formData.codigoSat}
                    onChange={(clave) => setFormData(prev => ({ ...prev, codigoSat: clave }))}
                    label="Código SAT"
                    placeholder="Search code"
                  />
                </div>
                <div>
                  <ClaveProdSearch
                    value={formData.unidadSat}
                    onChange={(clave) => setFormData(prev => ({ ...prev, unidadSat: clave }))}
                    label="Unidad SAT"
                    placeholder="Search unit"
                  />
                </div>
              </div>
            </div>

            {/* Description - Compact Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Brief product description..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-1.5 rounded font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded font-medium transition-colors text-sm"
              >
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}