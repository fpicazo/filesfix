import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Trash, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import ClaveProductSearch from '../components/shared/ClaveProductSearch'
import ClaveProdSearch from '../components/shared/ClaveProdSearch'
import http from '../config/http'

export default function PackagesPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [packagesList, setPackagesList] = useState([])
  const [editingPackage, setEditingPackage] = useState(null)
  const [availableProducts, setAvailableProducts] = useState([])
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    codigoSat: "",
    unidadSat: "",
    products: [] // Array of {productId, productName, quantity}
  })

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await http.get('/api/packages')
        console.log("Fetched packages:", data)
        setPackagesList(data)
      } catch (error) {
        console.error("Error fetching packages:", error)
      }
    }
    
    const fetchProducts = async () => {
      try {
        const { data } = await http.get('/api/products')
        setAvailableProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        // Mock data fallback
        setAvailableProducts([
          { _id: '1', name: 'Floral Centerpiece' },
          { _id: '2', name: 'Table Linens' },
          { _id: '3', name: 'Chair Covers' },
          { _id: '4', name: 'Lighting Setup' },
          { _id: '5', name: 'Sound System' },
          { _id: '6', name: 'Photography Package' }
        ])
      }
    }
    
    fetchPackages()
    fetchProducts()
  }, [])

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      price: parseFloat(formData.price)
    }
    
    if (editingPackage) {
      // Update existing package in local state
      setPackagesList(prev =>
        prev.map(pkg =>
          pkg._id === formData._id ? { ...pkg, ...submitData } : pkg
        )
      )
      try {
        await http.put(`/api/packages/${formData._id}`, submitData)
      } catch (error) {
        console.error("Error updating package:", error)
      }
    } else {
      // Call API to add the package first to get the complete object
      try {
        const { data: newPackage } = await http.post('/api/packages', submitData)
        // Add new package with server response to local state
        setPackagesList(prev => [...prev, newPackage])
      } catch (error) {
        console.error("Error adding package:", error)
      }
    }

    closeDrawer()
  }

  const deletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      // Update local state using _id
      setPackagesList(prev => prev.filter(pkg => pkg._id !== id))
      try {
        await http.delete(`/api/packages/${id}`)
      } catch (error) {
        console.error("Error deleting package:", error)
      }
    }
  }

  const openDrawer = (pkg = null) => {
    setEditingPackage(pkg)
    if (pkg) {
      setFormData({
        ...pkg,
        price: pkg.price.toString(),
        codigoSat: pkg.codigoSat || "",
        unidadSat: pkg.unidadSat || "",
        products: pkg.products || []
      })
    } else {
      setFormData({
        name: "",
        price: "",
        codigoSat: "",
        unidadSat: "",
        products: []
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingPackage(null)
    setFormData({
      name: "",
      price: "",
      codigoSat: "",
      unidadSat: "",
      products: []
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Product management functions
  const addProduct = () => {
    const productSelect = document.getElementById('productSelect')
    const selectedProductId = productSelect.value
    
    if (!selectedProductId) return
    
    const selectedProduct = availableProducts.find(p => p._id === selectedProductId)
    
    // Check if product is already added
    if (formData.products.some(p => p.productId === selectedProductId)) {
      alert('Product already added to package')
      return
    }
    
    const newProduct = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      quantity: 1
    }
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }))
    
    // Reset select
    productSelect.value = ""
  }

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.productId !== productId)
    }))
  }

  const updateProductQuantity = (productId, quantity) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.productId === productId ? { ...p, quantity: Math.max(1, parseInt(quantity) || 1) } : p
      )
    }))
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Package Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-gray-800 font-medium">{row.original.name}</p>
        </div>
      )
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      cell: (props) => (
        <p className="text-gray-800">
          {props.getValue() ? formatDateToDMY(props.getValue()) : '-'}
        </p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (props) => (
        <p className="text-gray-800 font-semibold">${props.getValue()?.toFixed(2)}</p>
      )
    },
    {
      header: "Products",
      accessorKey: "products",
      cell: ({ row }) => {
        const productsCount = row.original.products?.length || 0
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {productsCount} item{productsCount !== 1 ? 's' : ''}
            </span>
          </div>
        )
      },
      isHideSort: true
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Package"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deletePackage(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Package"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Packages" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={packagesList}
              columns={columns}
              dataNotFoundQuery="No packages found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Package
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Package */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingPackage ? "Edit Package" : "New Package"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Package Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter package name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Package Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ClaveProductSearch
                    value={formData.codigoSat}
                    onChange={(clave) => setFormData(prev => ({ ...prev, codigoSat: clave }))}
                    label="Código SAT"
                    placeholder="Search SAT code"
                  />
                </div>
                <div>
                  <ClaveProdSearch
                    value={formData.unidadSat}
                    onChange={(clave) => setFormData(prev => ({ ...prev, unidadSat: clave }))}
                    label="Unidad SAT"
                    placeholder="Search SAT unit"
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Package Products
              </h3>
              
              {/* Add Product */}
              <div className="flex gap-2">
                <select
                  id="productSelect"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a product to add</option>
                  {availableProducts.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addProduct}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Products Table */}
              {formData.products.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.products.map((product) => (
                        <tr key={product.productId}>
                          <td className="px-4 py-3 text-gray-900">
                            {product.productName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateProductQuantity(product.productId, e.target.value)}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeProduct(product.productId)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {formData.products.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  No products added yet. Select a product from the dropdown above.
                </div>
              )}
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
                {editingPackage ? "Update Package" : "Create Package"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}