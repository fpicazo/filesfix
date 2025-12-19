import React, { useState, useEffect } from 'react'
import http from '../config/http'
import { Calendar, Users, FileText, CreditCard, BarChart3, TrendingUp, DollarSign, Filter, AlertTriangle, Shield } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import PageHeader from '../components/PageHeader'


const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateFilter])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await http.get(`/api/analytics?dateFilter=${dateFilter}`)
      console.log("Fetched analytics data:", response.data)
      setAnalyticsData(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading analytics: {error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { summary, eventsByMonth, quotesByStatus, eventsRoi, topCustomers, eventsByGuests, incidentAnalytics, incidentTrends } = analyticsData

  // Prepare chart data
  const monthlyData = Object.entries(eventsByMonth || {}).map(([month, events]) => ({
    month,
    events: events.length,
    revenue: events.reduce((sum, event) => sum + (event.amount || 0), 0)
  }))

  const roiData = Object.entries(eventsRoi || {}).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    roi: data.roi
  }))

  const quoteStatusData = Object.entries(quotesByStatus || {}).map(([status, quotes]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: quotes.length,
    amount: quotes.reduce((sum, quote) => sum + (quote.amount || 0), 0)
  }))

  const guestData = (eventsByGuests || []).slice(0, 10).map(item => ({
    guests: `${item._id} guests`,
    events: item.totalEvents,
    revenue: item.totalAmount
  }))

  // Incident data processing
  const incidentCategoryData = Object.entries(incidentAnalytics?.incidentsByCategory || {}).map(([category, data]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: data.count || 0,
    amount: data.totalAmount || 0
  }))

  const incidentTrendData = (incidentTrends || []).map(trend => ({
    month: trend.month,
    incidents: trend.count || 0,
    cost: trend.totalAmount || 0
  }))

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  const StatCard = ({ title, value, subtitle, icon: Icon, bgGradient, iconBg, iconColor }) => (
    <div className={`${bgGradient} rounded-lg p-2.5 border ${iconBg.replace('bg-', 'border-')}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate">{title}</p>
          <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-600 truncate">{subtitle}</p>}
        </div>
        <div className={`${iconBg} rounded-full p-1.5 flex-shrink-0`}>
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
      </div>
    </div>
  )

  const actions = (
    <div></div>
  )

  return (
    <PageHeader title="Analytics" backPath="/" actions={actions}>
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="2024-01-01">This Year</option>
            <option value="2024-10-01">Last 3 Months</option>
            <option value="2024-11-01">Last 2 Months</option>
            <option value="2024-12-01">This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 mb-5">
        <StatCard
          title="Total Revenue"
          value={`$${(summary?.totalRevenue || 0).toLocaleString()}`}
          subtitle={`Net: $${((summary?.totalRevenue || 0) - (summary?.totalExpenses || 0)).toLocaleString()}`}
          icon={DollarSign}
          bgGradient="bg-gradient-to-br from-green-50 to-green-100"
          iconBg="bg-green-200"
          iconColor="text-green-700"
        />
        <StatCard
          title="Total Events"
          value={summary?.totalEvents || 0}
          subtitle={`${summary?.totalCustomers || 0} customers`}
          icon={Calendar}
          bgGradient="bg-gradient-to-br from-blue-50 to-blue-100"
          iconBg="bg-blue-200"
          iconColor="text-blue-700"
        />
        <StatCard
          title="Active Quotes"
          value={summary?.totalQuotes || 0}
          subtitle="Pending approval"
          icon={FileText}
          bgGradient="bg-gradient-to-br from-amber-50 to-amber-100"
          iconBg="bg-amber-200"
          iconColor="text-amber-700"
        />
        <StatCard
          title="Total Expenses"
          value={`$${(summary?.totalExpenses || 0).toLocaleString()}`}
          subtitle="Operating costs"
          icon={CreditCard}
          bgGradient="bg-gradient-to-br from-red-50 to-red-100"
          iconBg="bg-red-200"
          iconColor="text-red-700"
        />
        <StatCard
          title="Monthly Incidents"
          value={summary?.monthlyIncidents || 0}
          subtitle={`Total: ${incidentAnalytics?.totalIncidents || 0}`}
          icon={AlertTriangle}
          bgGradient="bg-gradient-to-br from-orange-50 to-orange-100"
          iconBg="bg-orange-200"
          iconColor="text-orange-700"
        />
        <StatCard
          title="Incident Costs"
          value={`$${(summary?.monthlyIncidentCosts || 0).toLocaleString()}`}
          subtitle={`Avg: $${(incidentAnalytics?.averageAmount || 0).toFixed(0)}`}
          icon={Shield}
          bgGradient="bg-gradient-to-br from-purple-50 to-purple-100"
          iconBg="bg-purple-200"
          iconColor="text-purple-700"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        {/* Monthly Events & Revenue */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Monthly Events & Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="events" fill="#8884d8" name="Events" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROI Analysis */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Monthly ROI Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#82ca9d" name="Income" />
              <Bar dataKey="expenses" fill="#ff7300" name="Expenses" />
              <Bar dataKey="roi" fill="#8884d8" name="ROI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        {/* Quote Status Distribution */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Quote Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={quoteStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {quoteStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Guest Count */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Events by Guest Count</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={guestData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="guests" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="events" fill="#8884d8" name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Incident Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        {/* Incident Trends */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Monthly Incident Trends</h3>
          {incidentTrendData && incidentTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={incidentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [
                  name === 'cost' ? `$${value.toLocaleString()}` : value,
                  name === 'incidents' ? 'Incidents' : 'Cost ($)'
                ]} />
                <Legend />
                <Bar yAxisId="left" dataKey="incidents" fill="#f59e0b" name="Incidents" />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#ef4444" name="Cost ($)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-500">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No incident data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Incident Categories */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Incidents by Category</h3>
          {incidentCategoryData && incidentCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incidentCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incidentCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Incidents']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-500">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No incident categories available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incident Summary Card */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-5">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Incident Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2.5 border border-orange-200">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-900">{incidentAnalytics?.totalIncidents || 0}</div>
              <div className="text-xs text-orange-700">Total Incidents</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2.5 border border-red-200">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-900">${(incidentAnalytics?.totalAmount || 0).toLocaleString()}</div>
              <div className="text-xs text-red-700">Total Cost</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2.5 border border-purple-200">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-900">${(incidentAnalytics?.averageAmount || 0).toFixed(0)}</div>
              <div className="text-xs text-purple-700">Average Cost</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200">
            <div className="flex items-center justify-center mb-1">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-900">{Object.keys(incidentAnalytics?.incidentsByCategory || {}).length}</div>
              <div className="text-xs text-blue-700">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(topCustomers || []).map((customer, index) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-800">{index + 1}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.eventCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalGuests || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(customer.totalAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </PageHeader>
  )
}

export default Analytics