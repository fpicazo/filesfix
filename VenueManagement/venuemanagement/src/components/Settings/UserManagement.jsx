import React, { useState, useEffect, useRef } from 'react'
import { Plus, Camera, User, Pencil, Trash } from 'lucide-react'
import http from '../../config/http'
import DrawerWrapper from '../DrawerWrapper'
import { CustomTable } from '../Table/CustomTable'
import uploadFileToS3 from '../../utils/uploadFileToS3'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [roles, setRoles] = useState([])
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    position: '',
    timezone: '',
    imageUrl: '',
    password: '',
    status: '',
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await http.get('/api/users')
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await http.get('/api/settings/roles')
        setRoles(data)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }
    fetchRoles()
  }, [])

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ")
    const first = parts[0]?.[0] || ""
    const second = parts[1]?.[0] || ""
    return (first + second).toUpperCase()
  }

  // Helper function to get role name from role ID
  const getRoleNameById = (roleId) => {
    const role = roles.find(r => r._id === roleId)
    return role ? role.name : 'User'
  }

  // Helper function to get role ID from role name
  const getRoleIdByName = (roleName) => {
    const role = roles.find(r => r.name === roleName)
    return role ? role._id : ''
  }

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
        module: 'users',
        recordId: editingUser?._id || 'temp-' + Date.now(),
        tenantId: 'default',
        tipo:"profile",
      })

      setFormData(prev => ({ ...prev, imageUrl }))
      console.log('User image uploaded successfully')
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convert role name back to role ID for API submission
    const submissionData = {
      ...formData,
      role: getRoleIdByName(formData.role) || formData.role
    }

    if (editingUser) {
      try {
        await http.put(`/api/users/${formData._id}`, submissionData)
        setUsers(prev => prev.map(u => (u._id === formData._id ? { ...formData, role: submissionData.role } : u)))
      } catch (error) {
        console.error('Error updating user:', error)
      }
    } else {
      try {
        const { data } = await http.post('/api/users', submissionData)
        setUsers(prev => [...prev, data])
      } catch (error) {
        console.error('Error creating user:', error)
      }
    }

    setDrawerOpen(false)
    setEditingUser(null)
    setFormData({ 
      name: '', 
      email: '', 
      role: '', 
      status: '',
      position: '', 
      timezone: '', 
      imageUrl: '',
      password: '',
    })
  }

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await http.delete(`/api/users/${id}`)
        setUsers(prev => prev.filter(u => u._id !== id))
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    // Convert role ID to role name for the form
    setFormData({
      ...user,
      role: getRoleNameById(user.role) || user.role
    })
    setDrawerOpen(true)
  }

  const getRoleBadge = (roleId) => {
    const roleName = getRoleNameById(roleId)
    const roleColors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'User': 'bg-gray-100 text-gray-800',
      'Editor': 'bg-green-100 text-green-800',
      'Viewer': 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[roleName] || 'bg-gray-100 text-gray-800'}`}>
        {roleName}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    }
    
    return status ? (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    ) : <span className="text-gray-400">—</span>
  }

  // Define columns for CustomTable
  const columns = [
    {
      header: "Team Member",
      accessorKey: "name",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
              {user.position && (
                <div className="text-xs text-gray-500">{user.position}</div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">{row.original.email}</div>
          <div className="text-xs text-gray-500">Primary contact</div>
        </div>
      )
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => getRoleBadge(row.original.role),
      meta: {
        filterVariant: "select",
        defaultLabel: "All Roles"
      }
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => getStatusBadge(row.original.status),
      meta: {
        filterVariant: "select",
        defaultLabel: "All Status"
      }
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditUser(row.original)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit User"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteUser(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete User"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>

        {/* Stats Cards */}
        <div className="flex items-center gap-4 flex-wrap mb-6">
          {/* Total Members Card */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          
          {/* Dynamic Role Cards */}
          {roles.map((role, index) => {
            const count = users.filter(u => u.role === role._id).length
            const colors = [
              'text-blue-600',
              'text-green-600', 
              'text-purple-600',
              'text-orange-600',
              'text-pink-600',
              'text-indigo-600'
            ]
            const colorClass = colors[index % colors.length]
            
            return (
              <div key={role._id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
                <div className={`text-2xl font-bold ${colorClass}`}>{count}</div>
                <div className="text-sm text-gray-600">{role.name}</div>
              </div>
            )
          })}
          
          {/* Users without roles */}
          {(() => {
            const usersWithoutRole = users.filter(u => !u.role || !roles.find(r => r._id === u.role)).length
            if (usersWithoutRole > 0) {
              return (
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm min-w-[120px]">
                  <div className="text-2xl font-bold text-gray-600">{usersWithoutRole}</div>
                  <div className="text-sm text-gray-600">No Role</div>
                </div>
              )
            }
            return null
          })()}
        </div>
      </div>

      {/* Main Content Card with CustomTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CustomTable
          data={users}
          columns={columns}
          dataNotFoundQuery="No team members yet. Get started by adding your first team member."
          additionalActions={
            <button
              onClick={() => {
                setEditingUser(null)
                setFormData({ 
                  name: '', 
                  email: '', 
                  role: '', 
                  status: '',
                  position: '', 
                  timezone: '', 
                  imageUrl: '',
                  password: ''
                })
                setDrawerOpen(true)
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium text-sm shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Team Member
            </button>
          }
        />
      </div>

      {/* Enhanced Drawer */}
      <DrawerWrapper
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditingUser(null)
          setImageError('')
        }}
        title={editingUser ? 'Edit Team Member' : 'Add New Team Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Profile Photo</h3>
            <div className="flex items-center gap-4">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Profile"
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
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
            <p className="text-sm text-gray-500 mt-2">
              At least 32 × 32px PNG or JPG file.
            </p>
            {imageError && (
              <p className="text-sm text-red-600 mt-2">{imageError}</p>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time zone</label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">(UTC+08:00) Kuala Lumpur, Singapore</option>
                  <option value="UTC-08:00">(UTC-08:00) Pacific Time</option>
                  <option value="UTC-05:00">(UTC-05:00) Eastern Time</option>
                  <option value="UTC+00:00">(UTC+00:00) UTC</option>
                  <option value="UTC+01:00">(UTC+01:00) Central European Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log in email address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
            </div>
          </div>

          {/* Delete Account Section (only for editing) */}
          {editingUser && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">Permanently delete this team member's account and all associated data.</p>
              <button
                type="button"
                onClick={() => deleteUser(editingUser._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex justify-between">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false)
                setEditingUser(null)
                setImageError('')
              }}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              {editingUser ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </DrawerWrapper>
    </div>
  )
}