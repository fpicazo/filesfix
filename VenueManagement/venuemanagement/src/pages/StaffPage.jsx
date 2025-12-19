import React, { useState, useEffect, useRef } from 'react'
import { Plus, User, Star, Camera, Pencil, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateToDMY } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import DrawerWrapper from '../components/DrawerWrapper'
import { CustomTable } from '../components/Table/CustomTable'
import http from '../config/http'
import uploadFileToS3 from '../utils/uploadFileToS3'

export default function StaffPage() {
  // State variables
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [editingStaff, setEditingStaff] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    cost: "",
    costType: "hourly",
    schedule: "",
    notes: "",
    status: "Active",
    hireDate: new Date().toISOString().split('T')[0],
    skills: [],
    imageUrl: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: ""
    },
    rating: 0
  })

  const positions = [
    'Event Manager',
    'Event Coordinator',
    'Venue Manager',
    'Catering Staff',
    'Security',
    'Cleaning Staff',
    'Bartender',
    'DJ/Entertainment',
    'Photographer',
    'Decorator',
    'Technical Support',
    'Administrative',
    'Kitchen Staff',
    'Server',
    'Host/Hostess',
    'Maintenance',
    'Other'
  ]

  const costTypes = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'weekly', label: 'Per Week' },
    { value: 'monthly', label: 'Per Month' },
    { value: 'per_event', label: 'Per Event' },
    { value: 'fixed', label: 'Fixed Rate' }
  ]

  const statusOptions = ['Active', 'Inactive', 'On Leave', 'Terminated', 'Probation']

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await http.get('/api/staff')
        console.log("Fetched staff:", data)
        setStaffList(data)
      } catch (error) {
        console.error("Error fetching staff:", error)
      }
    }
    
    fetchStaff()
  }, [])

  // Helper to get initials from name
  const getInitials = (name = "") => {
    const parts = name.trim().split(" ")
    const first = parts[0]?.[0] || ""
    const second = parts[1]?.[0] || ""
    return (first + second).toUpperCase()
  }

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
        module: 'staff',
        recordId: editingStaff?._id || 'temp-' + Date.now(),
        tenantId: 'default',
        tipo: "profile",
      })

      setFormData(prev => ({ ...prev, imageUrl }))
      console.log('Staff image uploaded successfully')
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

  // Format cost display
  const formatCost = (cost, costType) => {
    const typeLabels = {
      hourly: '/hr',
      daily: '/day',
      weekly: '/week',
      monthly: '/month',
      per_event: '/event',
      fixed: ''
    }
    return `$${cost}${typeLabels[costType] || ''}`
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Terminated': 'bg-red-100 text-red-800',
      'Probation': 'bg-orange-100 text-orange-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    const staffData = {
      ...formData,
      cost: parseFloat(formData.cost),
      rating: parseFloat(formData.rating) || 0,
      skills: formData.skills.filter(skill => skill.trim() !== '')
    }
    
    if (editingStaff) {
      // Update existing staff in local state
      setStaffList(prev =>
        prev.map(staff =>
          staff._id === editingStaff._id ? { ...staff, ...staffData } : staff
        )
      )
      try {
        await http.put(`/api/staff/${editingStaff._id}`, staffData)
      } catch (error) {
        console.error("Error updating staff:", error)
      }
    } else {
      // Add new staff
      try {
        const { data: newStaff } = await http.post('/api/staff', staffData)
        setStaffList(prev => [...prev, newStaff])
      } catch (error) {
        console.error("Error adding staff:", error)
      }
    }

    closeDrawer()
  }

  const deleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaffList(prev => prev.filter(staff => staff._id !== id))
      try {
        await http.delete(`/api/staff/${id}`)
      } catch (error) {
        console.error("Error deleting staff:", error)
      }
    }
  }

  const openDrawer = (staff = null) => {
    setEditingStaff(staff)
    setImageError('')
    if (staff) {
      setFormData({
        ...staff,
        cost: staff.cost?.toString() || "",
        hireDate: staff.hireDate ? staff.hireDate.split('T')[0] : new Date().toISOString().split('T')[0],
        skills: staff.skills || [],
        imageUrl: staff.imageUrl || staff.image || "",
        emergencyContact: staff.emergencyContact || {
          name: "", relationship: "", phone: "", email: ""
        }
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        cost: "",
        costType: "hourly",
        schedule: "",
        notes: "",
        status: "Active",
        hireDate: new Date().toISOString().split('T')[0],
        skills: [],
        imageUrl: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
          email: ""
        },
        rating: 0
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingStaff(null)
    setImageError('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }))
  }

  const updateSkill = (index, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }))
  }

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Staff Member",
      accessorKey: "name",
      cell: ({ row }) => {
        const staff = row.original
        return (
          <div className="flex items-center gap-3">
            {staff.imageUrl || staff.image ? (
              <img
                src={staff.imageUrl || staff.image}
                alt={staff.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-semibold">
                {getInitials(staff.name)}
              </div>
            )}
            <div>
              <p className="text-gray-800 font-medium">{staff.name}</p>
              {staff.hireDate && (
                <p className="text-xs text-gray-500">
                  Hired: {formatDateToDMY(staff.hireDate)}
                </p>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "Position",
      accessorKey: "position",
      meta: { filterVariant: "select", defaultLabel: "All Positions" },
      cell: (props) => (
        <p className="text-gray-800">{props.getValue()}</p>
      )
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: ({ row }) => (
        <div>
          <p className="text-gray-800">{row.original.email || 'No email'}</p>
          <p className="text-xs text-gray-500">{row.original.phone}</p>
        </div>
      )
    },
    {
      header: "Cost",
      accessorKey: "cost",
      cell: ({ row }) => (
        <p className="text-gray-800 font-semibold">
          {formatCost(row.original.cost, row.original.costType)}
        </p>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: (props) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm">{props.getValue() || 0}</span>
        </div>
      )
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDrawer(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Staff"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteStaff(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Staff"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageHeader title="Staff" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={staffList}
              columns={columns}
              dataNotFoundQuery="No staff members found"
              additionalActions={
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Staff
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Staff */}
        <DrawerWrapper
          open={drawerOpen}
          onClose={closeDrawer}
          title={editingStaff ? "Edit Staff Member" : "New Staff Member"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Profile Photo
              </h3>
              
              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Staff Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload photo'}
                  </button>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-medium"
                    >
                      Remove photo
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
                At least 32 × 32px PNG or JPG file.
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
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Position
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Position</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost & Schedule Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Cost & Schedule
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Cost
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
                    Cost Type
                  </label>
                  <select
                    name="costType"
                    value={formData.costType}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {costTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Schedule Notes
                </label>
                <textarea
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="General schedule notes..."
                />
              </div>
            </div>

            {/* Employment Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Employment Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Performance Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  Skills
                </h3>
                <button
                  type="button"
                  onClick={addSkill}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  + Add Skill
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter skill"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="emergencyContact.email"
                    value={formData.emergencyContact.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Additional Notes
              </h3>
              
              <div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Additional notes about this staff member..."
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
                {editingStaff ? "Update Staff" : "Create Staff"}
              </button>
            </div>
          </form>
        </DrawerWrapper>
      </div>
    </PageHeader>
  )
}