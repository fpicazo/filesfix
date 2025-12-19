import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, List, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import http from '../../config/http';

const FIELD_TYPES = [
  { id: 'text', name: 'Text Input', icon: 'T', requiresChoices: false },
  { id: 'dropdown', name: 'Dropdown', icon: '▼', requiresChoices: true },
  { id: 'checkbox', name: 'Checkboxes', icon: '☑', requiresChoices: true },
]

export default function DynamicFieldsManagementPage() {
  const [fields, setFields] = useState([])
  const [editingField, setEditingField] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchFields = async () => {
    try {
      const { data } = await http.get('/api/tenants')
      console.log('Fetched settings data:', data)
      setFields(data.customFields || [])
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [])

  const handleSaveField = async (updatedField) => {
    try {
      let updatedFields = [...fields]
      
      if (updatedField._id) {
        // Update existing field
        const index = updatedFields.findIndex(f => f._id === updatedField._id)
        if (index !== -1) {
          updatedFields[index] = updatedField
        }
      } else {
        // Add new field with generated ID
        updatedField._id = Date.now().toString()
        updatedFields.push(updatedField)
      }

      await http.put('/api/tenants', { customFields: updatedFields })
      
      setIsModalOpen(false)
      setEditingField(null)
      fetchFields()
    } catch (error) {
      console.error('Error saving field:', error)
    }
  }

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        const updatedFields = fields.filter(f => f._id !== fieldId)
        await http.put('/api/tenants', { customFields: updatedFields })
        fetchFields()
      } catch (error) {
        console.error('Error deleting field:', error)
      }
    }
  }

  const moveField = async (index, direction) => {
    const newFields = [...fields]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= newFields.length) return
    
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]
    
    try {
      await http.put('/api/tenants', { customFields: newFields })
      setFields(newFields)
    } catch (error) {
      console.error('Error updating field order:', error)
    }
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dynamic Event Fields</h2>
            <p className="text-gray-600 mt-1">Create custom fields with options for your events</p>
          </div>
          <button
            onClick={() => {
              setEditingField({ 
                name: '', 
                fieldType: 'text', 
                choices: [''],
                required: false,
                placeholder: ''
              })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{fields.length}</div>
            <div className="text-sm text-gray-600">Total Fields</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {fields.filter(f => f.required).length}
            </div>
            <div className="text-sm text-gray-600">Required Fields</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <div className="col-span-1">Order</div>
            <div className="col-span-3">Field Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Options</div>
            <div className="col-span-1">Required</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {fields.map((field, index) => {
            const fieldType = FIELD_TYPES.find(t => t.id === field.fieldType)
            return (
              <div key={field._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Order Controls */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Field Name */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-semibold">
                        {fieldType?.icon || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{field.name}</div>
                        <div className="text-xs text-gray-500">
                          {field.placeholder || 'No placeholder'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Type */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {fieldType?.name || field.fieldType}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="col-span-4">
                    <div className="flex flex-wrap gap-1">
                      {fieldType?.requiresChoices ? (
                        <>
                          {(field.choices || []).slice(0, 3).map((choice, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {choice}
                            </span>
                          ))}
                          {(field.choices || []).length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{field.choices.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No options needed</span>
                      )}
                    </div>
                  </div>

                  {/* Required */}
                  <div className="col-span-1">
                    {field.required ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        No
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => {
                          setEditingField(field)
                          setIsModalOpen(true)
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Edit field"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field._id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {fields.length === 0 && (
          <div className="px-6 py-12 text-center">
            <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No fields yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get started by creating your first dynamic field for events.
            </p>
            <button
              onClick={() => {
                setEditingField({ 
                  name: '', 
                  fieldType: 'text', 
                  choices: [''],
                  required: false,
                  placeholder: ''
                })
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>
        )}
      </div>

      {/* Edit Field Modal */}
      {isModalOpen && (
        <EditFieldModal
          field={editingField}
          onClose={() => {
            setIsModalOpen(false)
            setEditingField(null)
          }}
          onSave={handleSaveField}
        />
      )}
    </div>
  )
}

function EditFieldModal({ field, onClose, onSave }) {
  const [name, setName] = useState(field.name || '')
  const [fieldType, setFieldType] = useState(field.fieldType || 'text')
  const [choices, setChoices] = useState(field.choices || [''])
  const [required, setRequired] = useState(field.required || false)
  const [placeholder, setPlaceholder] = useState(field.placeholder || '')

  const selectedFieldType = FIELD_TYPES.find(t => t.id === fieldType)

  const addChoice = () => {
    setChoices([...choices, ''])
  }

  const removeChoice = (index) => {
    if (choices.length > 1) {
      setChoices(choices.filter((_, i) => i !== index))
    }
  }

  const updateChoice = (index, value) => {
    const newChoices = [...choices]
    newChoices[index] = value
    setChoices(newChoices)
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a field name')
      return
    }

    if (selectedFieldType?.requiresChoices) {
      const validChoices = choices.filter(c => c.trim())
      if (validChoices.length === 0) {
        alert('Please add at least one option')
        return
      }
      onSave({ 
        ...field, 
        name: name.trim(), 
        fieldType, 
        choices: validChoices,
        required,
        placeholder: placeholder.trim()
      })
    } else {
      onSave({ 
        ...field, 
        name: name.trim(), 
        fieldType,
        required,
        placeholder: placeholder.trim(),
        choices: undefined
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {field._id ? 'Edit Field' : 'Create New Field'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Configure field properties and options
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
          {/* Field Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Sheet Type, Table Size, Seating Arrangement"
              required
            />
          </div>

          {/* Field Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFieldType(type.id)}
                  className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all ${
                    fieldType === type.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl">{type.icon}</div>
                  <div className="text-sm font-medium text-center">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder Text (Optional)
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Select an option, Enter value..."
            />
          </div>

          {/* Required Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white relative"></div>
              <span className="text-sm font-medium text-gray-700">
                Make this field required
              </span>
            </label>
          </div>

          {/* Choices (if applicable) */}
          {selectedFieldType?.requiresChoices && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Options/Choices *
                </label>
                <button
                  type="button"
                  onClick={addChoice}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add Option
                </button>
              </div>
              <div className="space-y-2">
                {choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => updateChoice(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Option ${index + 1}`}
                    />
                    {choices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add options that users can select from (e.g., Small, Medium, Large)
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {field._id ? 'Save Changes' : 'Create Field'}
          </button>
        </div>
      </div>
    </div>
  )
}