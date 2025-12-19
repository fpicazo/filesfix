import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react'
import http from '../../config/http'

const MODULE_CATEGORIES = {
  'Core': [
    { id: 'dashboard', name: 'Dashboard', description: 'Access to main dashboard and overview' },
  ],
  'Business Operations': [
    { id: 'events', name: 'Events', description: 'Manage and view events' },
    { id: 'customers', name: 'Customers', description: 'Customer management and contacts' },
    { id: 'quotes', name: 'Quotes', description: 'Create and manage quotes' },
  ],
  'Inventory & Equipment': [
    { id: 'products', name: 'Products', description: 'Product catalog and inventory' },
    { id: 'equipment', name: 'Equipment', description: 'Equipment tracking and maintenance' },
    { id: 'rental', name: 'Rental', description: 'Equipment rental management' },
    { id: 'packages', name: 'Packages', description: 'Package and bundle management' },
  ],
  'Financial Management': [
    { id: 'invoices', name: 'Invoices', description: 'Invoice creation and management' },
    { id: 'payments', name: 'Payments', description: 'Payment processing and tracking' },
    { id: 'expenses', name: 'Expenses', description: 'Expense tracking and management' },
  ],
  'Communication & Scheduling': [
    { id: 'messaging', name: 'Messaging', description: 'Internal communication and messaging' },
    { id: 'calendar', name: 'Calendar', description: 'Schedule and calendar management' },
  ],
  'Management & Reporting': [
    { id: 'analytics', name: 'Analytics', description: 'Reports and data analysis' },
    { id: 'staff', name: 'Staff', description: 'Staff management and scheduling' },
    { id: 'tasks', name: 'Tasks', description: 'Task management and assignments' },
    { id: 'incidents', name: 'Incidents', description: 'Incident reporting and tracking' },
  ],
  'System': [
    { id: 'settings', name: 'Settings', description: 'System configuration and preferences' },
  ]
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([])
  const [editingRole, setEditingRole] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRoles = async () => {
    try {
      const { data } = await http.get('/api/settings/roles')
      setRoles(data)
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleSaveRole = async (updatedRole) => {
    try {
      if (updatedRole._id) {
        await http.put(`/api/settings/roles/${updatedRole._id}`, updatedRole)
      } else {
        await http.post('/api/settings/roles', updatedRole)
      }
      setIsModalOpen(false)
      setEditingRole(null)
      fetchRoles()
    } catch (error) {
      console.error('Error saving role:', error)
    }
  }

  const handleDeleteRole = async (roleId) => {
    const roleToDelete = roles.find(r => r._id === roleId)
    
    // Prevent deletion of Admin role
    if (roleToDelete?.name?.toLowerCase() === 'admin') {
      alert('The Admin role cannot be deleted as it is required for system administration.')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await http.delete(`/api/settings/roles/${roleId}`)
        fetchRoles()
      } catch (error) {
        console.error('Error deleting role:', error)
      }
    }
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
            <p className="text-gray-600 mt-1">Configure roles and their module permissions</p>
          </div>
          <button
            onClick={() => {
              setEditingRole({ name: '', allowedModules: [] })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <div className="col-span-3">Role Name</div>
            <div className="col-span-6">Permissions</div>
            <div className="col-span-2">Users</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {roles.map((role) => (
            <div key={role._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Role Name */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                      {role.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">{role.name}</div>
                        {role.name?.toLowerCase() === 'admin' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Protected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Role</div>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="col-span-6">
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const allModules = Object.values(MODULE_CATEGORIES).flat()
                      const userModules = (role.allowedModules || [])
                        .map(moduleId => allModules.find(m => m.id === moduleId))
                        .filter(Boolean)
                      
                      return (
                        <>
                          {userModules.slice(0, 5).map((module) => (
                            <span
                              key={module.id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {module.name}
                            </span>
                          ))}
                          {userModules.length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{userModules.length - 5} more
                            </span>
                          )}
                          {userModules.length === 0 && (
                            <span className="text-sm text-gray-500">No permissions assigned</span>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Users Count */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">0 users</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => {
                        setEditingRole(role)
                        setIsModalOpen(true)
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Edit role"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {/* Only show delete button for non-admin roles */}
                    {role.name?.toLowerCase() !== 'admin' && (
                      <button
                        onClick={() => handleDeleteRole(role._id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {roles.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No roles yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get started by creating your first role with custom permissions.
            </p>
            <button
              onClick={() => {
                setEditingRole({ name: '', allowedModules: [] })
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Role
            </button>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {isModalOpen && (
        <EditRoleModal
          role={editingRole}
          onClose={() => {
            setIsModalOpen(false)
            setEditingRole(null)
          }}
          onSave={handleSaveRole}
        />
      )}
    </div>
  )
}

function EditRoleModal({ role, onClose, onSave }) {
  const [name, setName] = useState(role.name || '')
  const [allowedModules, setAllowedModules] = useState(role.allowedModules || [])
  
  // Check if this is the admin role
  const isAdminRole = role.name?.toLowerCase() === 'admin'

  const toggleModule = (moduleId) => {
    // Prevent editing admin role permissions
    if (isAdminRole) return
    
    setAllowedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(m => m !== moduleId)
      } else {
        return [...prev, moduleId]
      }
    })
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a role name')
      return
    }
    onSave({ ...role, name: name.trim(), allowedModules })
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {role._id ? 'Edit Role' : 'Create New Role'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Configure role name and module permissions by category
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Admin Role Protection Notice */}
          {isAdminRole && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Protected System Role</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    The Admin role is protected and cannot be modified to ensure system administration access is maintained.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Role Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isAdminRole}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isAdminRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
              }`}
              placeholder="Enter role name (e.g., Manager, Sales Rep)"
              required
            />
            {isAdminRole && (
              <p className="mt-1 text-xs text-gray-500">Admin role name cannot be changed</p>
            )}
          </div>

          {/* Module Permissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Module Permissions</h4>
              <div className="text-xs text-gray-500">
                {allowedModules.length} of {Object.values(MODULE_CATEGORIES).flat().length} modules selected
              </div>
            </div>
            
            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(MODULE_CATEGORIES).map(([categoryName, modules]) => (
                <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">{categoryName}</h5>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isAdminRole}
                          onClick={() => {
                            if (isAdminRole) return
                            const categoryModuleIds = modules.map(m => m.id)
                            const allSelected = categoryModuleIds.every(id => allowedModules.includes(id))
                            if (allSelected) {
                              setAllowedModules(prev => prev.filter(id => !categoryModuleIds.includes(id)))
                            } else {
                              setAllowedModules(prev => [...new Set([...prev, ...categoryModuleIds])])
                            }
                          }}
                          className={`text-xs font-medium ${
                            isAdminRole 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-indigo-600 hover:text-indigo-800'
                          }`}
                        >
                          {modules.every(m => allowedModules.includes(m.id)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category Modules */}
                  <div className="divide-y divide-gray-200">
                    {modules.map((module) => (
                      <div key={module.id} className={`p-3 ${isAdminRole ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${isAdminRole ? 'text-gray-500' : 'text-gray-900'}`}>
                              {module.name}
                            </div>
                            <div className={`text-xs mt-1 ${isAdminRole ? 'text-gray-400' : 'text-gray-500'}`}>
                              {module.description}
                            </div>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <label className={`relative inline-flex items-center ${isAdminRole ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={allowedModules.includes(module.id)}
                                onChange={() => toggleModule(module.id)}
                                disabled={isAdminRole}
                              />
                              <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                isAdminRole
                                  ? 'bg-gray-300 after:bg-gray-200 after:border-gray-300'
                                  : allowedModules.includes(module.id)
                                    ? 'bg-indigo-600 after:translate-x-full after:border-white after:bg-white'
                                    : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 after:bg-white after:border-gray-300'
                              }`}></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {isAdminRole ? 'Close' : 'Discard'}
          </button>
          {!isAdminRole && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save changes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}