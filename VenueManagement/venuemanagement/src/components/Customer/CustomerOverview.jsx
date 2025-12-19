import React, { useState } from 'react'
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Phone, 
  Building2, 
  Gift, 
  Star, 
  Users 
} from 'lucide-react'
import http from '../../config/http'
import { formatDateToDMY } from '../../utils/formatDate'
import EditIcon from '../../assets/helperIcons/EditIcon'

export default function CustomerOverview({ customer, customerId, onUpdate }) {
  const [editingOverview, setEditingOverview] = useState(false)
  const [overviewDraft, setOverviewDraft] = useState({
    birthday: customer.birthday || '',
    source: customer.source || '',
    referredBy: customer.referredBy || '',
    priority: customer.priority || 'medium',
    preferredContactMethod: customer.preferredContactMethod || 'email',
    nextFollowUpDate: customer.nextFollowUpDate || '',
    preferences: customer.preferences || '',
    specialRequests: customer.specialRequests || '',
    assignedTo: customer.assignedTo || '',
    taxID: customer.taxID || '',
    regimenFiscal: customer.regimenFiscal || ''
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRegimenFiscalLabel = (codigo) => {
    const regimenesMap = {
      '601': 'General de Ley Personas Morales',
      '603': 'Personas Morales con Fines no Lucrativos',
      '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
      '606': 'Arrendamiento',
      '607': 'Régimen de Enajenación o Adquisición de Bienes',
      '608': 'Demás ingresos',
      '610': 'Residentes en el Extranjero sin Establecimiento Permanente en México',
      '611': 'Ingresos por Dividendos (socios y accionistas)',
      '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
      '614': 'Ingresos por intereses',
      '615': 'Régimen de los ingresos por obtención de premios',
      '616': 'Sin obligaciones fiscales',
      '620': 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
      '621': 'Incorporación Fiscal',
      '622': 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
      '623': 'Opcional para Grupos de Sociedades',
      '624': 'Coordinados',
      '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
      '626': 'Régimen Simplificado de Confianza'
    }
    return regimenesMap[codigo] || codigo
  }

  const handleSaveOverview = async () => {
    try {
      await http.put('/api/customers/' + customerId, overviewDraft)
      if (onUpdate) {
        onUpdate({ ...customer, ...overviewDraft })
      }
      setEditingOverview(false)
    } catch (error) {
      console.error("Error saving overview data:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditingOverview(false)
    setOverviewDraft({
      birthday: customer.birthday || '',
      source: customer.source || '',
      referredBy: customer.referredBy || '',
      priority: customer.priority || 'medium',
      preferredContactMethod: customer.preferredContactMethod || 'email',
      nextFollowUpDate: customer.nextFollowUpDate || '',
      preferences: customer.preferences || '',
      specialRequests: customer.specialRequests || '',
      assignedTo: customer.assignedTo || '',
      taxID: customer.taxID || '',
      regimenFiscal: customer.regimenFiscal || ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-purple-900">Lifetime Value</span>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-purple-900">{formatCurrency(customer.lifetimeValue)}</p>
          <p className="text-xs text-purple-600 mt-0.5">Total revenue</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-900">Total Events</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-900">{customer.events || 0}</p>
          <p className="text-xs text-blue-600 mt-0.5">Events organized</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-green-900">Avg Event Value</span>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-900">{formatCurrency(customer.averageEventValue)}</p>
          <p className="text-xs text-green-600 mt-0.5">Per event average</p>
        </div>
      </div>

      {/* Customer Overview Details */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-800">Customer Overview</h3>
          {editingOverview ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveOverview}
                className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-xs text-gray-600 px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingOverview(true)}>
              <EditIcon />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Star className="h-4 w-4" />
              Priority
            </label>
            {editingOverview ? (
              <select
                value={overviewDraft.priority}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(customer.priority)}`}>
                {customer.priority ? customer.priority.charAt(0).toUpperCase() + customer.priority.slice(1) : 'Medium'}
              </span>
            )}
          </div>

          

          {/* Anniversary */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              Anniversary
            </label>
            {editingOverview ? (
              <input
                type="date"
                value={overviewDraft.anniversary ? new Date(overviewDraft.anniversary).toISOString().split('T')[0] : ''}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, anniversary: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
              />
            ) : (
              <p className="text-gray-800 text-sm font-medium">
                {customer.anniversary ? formatDateToDMY(customer.anniversary) : '-'}
              </p>
            )}
          </div>

          {/* Source */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Users className="h-4 w-4" />
              Source
            </label>
            {editingOverview ? (
              <select
                value={overviewDraft.source}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, source: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
              >
                <option value="">Select source</option>
                <option value="referral">Referral</option>
                <option value="social-media">Social Media</option>
                <option value="website">Website</option>
                <option value="walk-in">Walk-in</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="event">Event/Fair</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-800 font-medium">{customer.source || '-'}</p>
            )}
          </div>

          {/* Referred By */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Users className="h-4 w-4" />
              Referred By
            </label>
            {editingOverview ? (
              <input
                type="text"
                value={overviewDraft.referredBy}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, referredBy: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                placeholder="Who referred this customer"
              />
            ) : (
              <p className="text-gray-800 font-medium">{customer.referredBy || '-'}</p>
            )}
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Phone className="h-4 w-4" />
              Preferred Contact
            </label>
            {editingOverview ? (
              <select
                value={overviewDraft.preferredContactMethod}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, preferredContactMethod: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="in-person">In-Person</option>
              </select>
            ) : (
              <p className="text-gray-800 font-medium capitalize">
                {customer.preferredContactMethod || 'Email'}
              </p>
            )}
          </div>

          {/* Next Follow-up Date */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              Next Follow-up
            </label>
            {editingOverview ? (
              <input
                type="date"
                value={overviewDraft.nextFollowUpDate ? new Date(overviewDraft.nextFollowUpDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, nextFollowUpDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
              />
            ) : (
              <p className="text-gray-800 font-medium">
                {customer.nextFollowUpDate ? formatDateToDMY(customer.nextFollowUpDate) : '-'}
              </p>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Users className="h-4 w-4" />
              Assigned To
            </label>
            {editingOverview ? (
              <input
                type="text"
                value={overviewDraft.assignedTo}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, assignedTo: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                placeholder="Team member name"
              />
            ) : (
              <p className="text-gray-800 font-medium">{customer.assignedTo || '-'}</p>
            )}
          </div>

          {/* Tax ID */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Building2 className="h-4 w-4" />
              Tax ID
            </label>
            {editingOverview ? (
              <input
                type="text"
                value={overviewDraft.taxID}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, taxID: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                placeholder="Tax ID"
              />
            ) : (
              <p className="text-gray-800 font-medium">{customer.taxID || '-'}</p>
            )}
          </div>

          {/* Régimen Fiscal */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Building2 className="h-4 w-4" />
              Régimen Fiscal
            </label>
            {editingOverview ? (
              <select
                value={overviewDraft.regimenFiscal}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, regimenFiscal: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
              >
                <option value="">Select Régimen Fiscal</option>
                <option value="601">General de Ley Personas Morales</option>
                <option value="603">Personas Morales con Fines no Lucrativos</option>
                <option value="605">Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                <option value="606">Arrendamiento</option>
                <option value="607">Régimen de Enajenación o Adquisición de Bienes</option>
                <option value="608">Demás ingresos</option>
                <option value="610">Residentes en el Extranjero sin Establecimiento Permanente en México</option>
                <option value="611">Ingresos por Dividendos (socios y accionistas)</option>
                <option value="612">Personas Físicas con Actividades Empresariales y Profesionales</option>
                <option value="614">Ingresos por intereses</option>
                <option value="615">Régimen de los ingresos por obtención de premios</option>
                <option value="616">Sin obligaciones fiscales</option>
                <option value="620">Sociedades Cooperativas de Producción que optan por diferir sus ingresos</option>
                <option value="621">Incorporación Fiscal</option>
                <option value="622">Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</option>
                <option value="623">Opcional para Grupos de Sociedades</option>
                <option value="624">Coordinados</option>
                <option value="625">Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                <option value="626">Régimen Simplificado de Confianza</option>
              </select>
            ) : (
              <p className="text-gray-800 font-medium">{getRegimenFiscalLabel(customer.regimenFiscal) || '-'}</p>
            )}
          </div>

          {/* Preferences - Full Width */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Star className="h-4 w-4" />
              Preferences
            </label>
            {editingOverview ? (
              <textarea
                value={overviewDraft.preferences}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, preferences: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                rows="2"
                placeholder="Dietary restrictions, style preferences, etc."
              />
            ) : (
              <p className="text-gray-800 text-sm">{customer.preferences || '-'}</p>
            )}
          </div>

          {/* Special Requests - Full Width */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
              <Star className="h-4 w-4" />
              Special Requests
            </label>
            {editingOverview ? (
              <textarea
                value={overviewDraft.specialRequests}
                onChange={(e) => setOverviewDraft({ ...overviewDraft, specialRequests: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                rows="2"
                placeholder="Any special requests or requirements"
              />
            ) : (
              <p className="text-gray-800 text-sm">{customer.specialRequests || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {customer.lastEvent && (
            <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-800">Last Event</p>
                <p className="text-xs text-gray-600">{customer.lastEvent}</p>
              </div>
            </div>
          )}
          {customer.lastContactDate && (
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <Phone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-800">Last Contact</p>
                <p className="text-xs text-gray-600">{formatDateToDMY(customer.lastContactDate)}</p>
              </div>
            </div>
          )}
          {!customer.lastEvent && !customer.lastContactDate && (
            <p className="text-xs text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}