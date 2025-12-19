import React, { useState, useEffect, useRef } from 'react'
import { Plus, Delete, Edit2, Wrench, Camera, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'
import uploadFileToS3 from '../utils/uploadFileToS3'

export default function EquipmentPage() {
  // State variables
  const [searchTerm, setSearchTerm] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [equipmentList, setEquipmentList] = useState([])
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    cost: "",
    price: "",
    serialNumber: "",
    quantity: "1",
    purshaseDate: new Date().toISOString().split('T')[0],
    status: "Available",
    imageUrl: ""
  })

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data } = await http.get('/api/equipments')
        console.log("Fetched equipment:", data)
        setEquipmentList(data)
      } catch (error) {
        console.error("Error fetching equipment:", error)
      }
    }
    
    fetchEquipment()
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
        module: 'equipment',
        recordId: editingEquipment?._id || 'temp-' + Date.now(),
        tenantId: 'default',
        tipo: "equipment-image",
      })

      setFormData(prev => ({ ...prev, imageUrl }))
      console.log('Equipment image uploaded successfully')
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

  // Filter equipment by search term
  const filteredEquipment = equipmentList.filter(equipment =>
    equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment?.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.cost.toString().includes(searchTerm) ||
    equipment.price.toString().includes(searchTerm)
  )

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      cost: parseFloat(formData.cost),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 1,
      serialNumber: formData.serialNumber.trim() || null
    }
    
    if (editingEquipment) {
      // Update existing equipment in local state
      setEquipmentList(prev =>
        prev.map(equipment =>
          equipment._id === formData._id ? { ...equipment, ...submitData } : equipment
        )
      )
      // Call API to update the equipment
      try {
        await http.put(`/api/equipments/${formData._id}`, submitData)
      } catch (error) {
        console.error("Error updating equipment:", error)
      }
    } else {
      // Call API to add the equipment first to get the complete object
      try {
        const { data: newEquipment } = await http.post('/api/equipments', submitData)
        // Add new equipment with server response to local state
        setEquipmentList(prev => [...prev, newEquipment])
      } catch (error) {
        console.error("Error adding equipment:", error)
      }
    }

    closeDrawer()
  }

  const deleteEquipment = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      // Update local state using _id
      setEquipmentList(prev => prev.filter(equipment => equipment._id !== id))
      try {
        await http.delete(`/api/equipments/${id}`)
      } catch (error) {
        console.error("Error deleting equipment:", error)
      }
    }
  }

  const openDrawer = (equipment = null) => {
    setEditingEquipment(equipment)
    setImageError('')
    if (equipment) {
      setFormData({
        ...equipment,
        cost: equipment.cost.toString(),
        price: equipment.price.toString(),
        quantity: equipment.quantity.toString(),
        purshaseDate: equipment.purshaseDate ? equipment.purshaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        serialNumber: equipment.serialNumber || ""
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        cost: "",
        price: "",
        serialNumber: "",
        quantity: "1",
        purshaseDate: new Date().toISOString().split('T')[0],
        status: "Available",
        imageUrl: ""
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingEquipment(null)
    setImageError('')
    setFormData({
      name: "",
      description: "",
      category: "",
      cost: "",
      price: "",
      serialNumber: "",
      quantity: "1",
      purshaseDate: new Date().toISOString().split('T')[0],
      status: "Available",
      imageUrl: ""
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
      'In Use': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Out of Service': 'bg-red-100 text-red-800',
      'Retired': 'bg-gray-100 text-gray-800'
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
      header: "Equipment",
      accessorKey: "name",
      cell: ({ row }) => {
        const equipment = row.original
        return (
          <div className="flex items-center gap-3">
            {equipment.imageUrl ? (
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-gray-800 font-medium">{equipment.name}</p>
              {equipment.description && (
                <p className="text-gray-500 text-xs truncate max-w-xs">
                  {equipment.description}
                </p>
              )}
              {equipment.purshaseDate && (
                <p className="text-gray-400 text-xs">
                  Purchased: {formatDateToDMY(equipment.purshaseDate)}
                </p>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "Serial Number",
      accessorKey: "serialNumber",
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
      header: "Cost",
      accessorKey: "cost",
      cell: (props) => (
        <p className="text-gray-800 font-medium">${props.getValue()?.toFixed(2)}</p>
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
      header: "Quantity",
      accessorKey: "quantity",
      cell: (props) => (
        <p className="text-sm font-medium text-gray-800 text-center">
          {props.getValue()}
        </p>
      )
    },
    {
      header: "Purchase Date",
      accessorKey: "purshaseDate",
      cell: (props) => props.getValue() ? formatDateToDMY(props.getValue()) : '-',
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
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Equipment"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteEquipment(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Equipment"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Equipment" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={filteredEquipment}
              columns={columns}
              dataNotFoundQuery="No equipment found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Equipment
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Equipment */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingEquipment ? "Edit Equipment" : "New Equipment"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Equipment Image Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Equipment Image
              </h3>
              
              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Equipment"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Wrench className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </button>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-medium"
                    >
                      Remove Image
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
              <p className="text-sm text-gray-500">
                PNG, JPG or GIF up to 5MB. Recommended size: 400 × 400px.
              </p>
              {imageError && (
                <p className="text-sm text-red-600">{imageError}</p>
              )}
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter equipment name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Equipment serial number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Audio/Visual">Audio/Visual</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Camera">Camera</option>
                    <option value="Sound System">Sound System</option>
                    <option value="Stage Equipment">Stage Equipment</option>
                    <option value="Projection">Projection</option>
                    <option value="Power Tools">Power Tools</option>
                    <option value="Safety Equipment">Safety Equipment</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Cost *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Rental Price *
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

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purshaseDate"
                    value={formData.purshaseDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Description
              </h3>
              
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe the equipment details, specifications, condition, etc..."
                />
              </div>
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
                {editingEquipment ? "Update Equipment" : "Create Equipment"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}