import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import http from "../config/http";
import { formatDateToDMY } from '../utils/formatDate'
import FileImport from '../components/shared/FileList'
import LogsTimeline from '../components/shared/LogsTimeline'
import uploadFileToS3 from '../utils/uploadFileToS3'
import EditIcon from '../assets/helperIcons/EditIcon'
import UserIcon from '../assets/helperIcons/UserIcon'
import CustomerOverview from '../components/Customer/CustomerOverview'
import RightIcon from "../assets/helperIcons/RightIcon";
import { useNavigate } from "react-router-dom";

export default function CustomerDetail() {
  const [customer, setCustomer] = useState({})
  const { id } = useParams()
  const navigate = useNavigate();

  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState("overview")
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState("")
  const [eventsData, setEventsData] = useState([])
  const [quotesData, setQuotesData] = useState([])
  const [logsData, setLogsData] = useState([])

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  const [editingDetails, setEditingDetails] = useState(false)
  const [detailsDraft, setDetailsDraft] = useState({
    name: '',
    subText: '',
    email: '',
    phone: '',
    address: '',
    imageUrl: ''
  })

  const [editingBilling, setEditingBilling] = useState(false)
  const [billingDraft, setBillingDraft] = useState({
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    billingZip: ''
  })

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await http.get('/api/customers/' + id)
        console.log(response.data)
        setCustomer(response.data)
        setNotesDraft(response.data.notes)
        setLogsData(response.data?.related?.logs || [])
        setDetailsDraft({
          name: response.data.name,
          subText: response.data.subText,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          imageUrl: response.data.imageUrl
        })
        setBillingDraft({
          billingStreet: response.data.billingStreet || '',
          billingCity: response.data.billingCity || '',
          billingState: response.data.billingState || '',
          billingCountry: response.data.billingCountry || '',
          billingZip: response.data.billingZip || ''
        })
        setEventsData(response.data?.related?.events || [])
        setQuotesData(response.data?.related?.quotes || [])
      } catch (error) {
        console.error("Error fetching customer data:", error)
      }
    }
    fetchCustomer()
  }, [id])

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ")
    const first = parts[0]?.[0] || ""
    const second = parts[1]?.[0] || ""
    return (first + second).toUpperCase()
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
        module: 'customers',
        recordId: id,
        tenantId: customer.tenantId,
        tipo: "profile",
      })

      await http.put('/api/customers/' + id, { imageUrl })
      
      setCustomer(prev => ({ ...prev, imageUrl }))
      setDetailsDraft(prev => ({ ...prev, imageUrl }))
      
      console.log('Customer image updated successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      setImageError('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveNotes = () => {
    setCustomer(prev => ({ ...prev, notes: notesDraft }))
    setEditingNotes(false)
    try {
      http.put('/api/customers/' + id, { notes: notesDraft })
    } catch (error) {
      console.error("Error saving customer notes:", error)
    }
  }

  const handleSaveDetails = () => {
    setCustomer(prev => ({
      ...prev,
      name: detailsDraft.name,
      subText: detailsDraft.subText,
      email: detailsDraft.email,
      phone: detailsDraft.phone,
      address: detailsDraft.address,
      imageUrl: detailsDraft.imageUrl
    }))
    setEditingDetails(false)
    try {
      http.put('/api/customers/' + id, {
        name: detailsDraft.name,
        subText: detailsDraft.subText,
        email: detailsDraft.email,
        phone: detailsDraft.phone,
        address: detailsDraft.address,
        imageUrl: detailsDraft.imageUrl
      })
    } catch (error) {
      console.error("Error saving customer details:", error)
    }
  }

  const handleSaveBilling = () => {
    setCustomer(prev => ({
      ...prev,
      billingStreet: billingDraft.billingStreet,
      billingCity: billingDraft.billingCity,
      billingState: billingDraft.billingState,
      billingCountry: billingDraft.billingCountry,
      billingZip: billingDraft.billingZip
    }))
    setEditingBilling(false)
    try {
      http.put('/api/customers/' + id, {
        billingStreet: billingDraft.billingStreet,
        billingCity: billingDraft.billingCity,
        billingState: billingDraft.billingState,
        billingCountry: billingDraft.billingCountry,
        billingZip: billingDraft.billingZip
      })
    } catch (error) {
      console.error("Error saving customer billing information:", error)
    }
  }

  const handleCustomerUpdate = (updatedCustomer) => {
    setCustomer(updatedCustomer)
  }

  const renderTable = () => {
    if (activeTab === "events") {
      return (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Name</th>
              <th className="py-2">Date</th>
              <th className="py-2">Type</th>
              <th className="py-2">Guests</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {eventsData.map(evt => (
              <tr key={evt._id} className="border-b last:border-none hover:bg-purple-50 transition-colors">
                <td className="py-3">{evt.name}</td>
                <td className="py-3">{formatDateToDMY(evt.date)}</td>
                <td className="py-3">{evt.type}</td>
                <td className="py-3 text-center">{evt.guests}</td>
                <td className="py-3">
                  <span className={`font-medium ${
                    evt.status === "Confirmed" ? "text-green-600" : 
                    evt.status === "Pending" ? "text-orange-600" :
                    evt.status === "Completed" ? "text-blue-600" :
                    evt.status === "Cancelled" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {evt.status}
                  </span>
                </td>
                <td className="py-3 text-center">
              <button
                onClick={() => navigate(`/events/${evt._id}`)}
                className="py-1.5 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-purple-50"
>
  Details
  <RightIcon />
              </button>
            </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    } 
    else if (activeTab === "attachments") {
      return (
        <FileImport module="customers" parentId={id} tenantId={customer.tenantId} files={customer?.related?.attachments} />
      )
    } 
     else if (activeTab === "logs") {
      return (
<LogsTimeline 
  activities={logsData || []}
  title="Logs"
/>      )
    } 
    else {
      return (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Referencia</th>
              <th className="py-2">Date</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
               <th className="py-2 text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {quotesData.map(quote => (
              <tr key={quote._id} className="border-b last:border-none hover:bg-purple-50 transition-colors">
                <td className="py-3">{quote.quoteNumber}</td>
                <td className="py-3">{formatDateToDMY(quote.date)}</td>
                <td className="py-3">{quote.amount}</td>
                <td className="py-3">
                  <span className="font-medium text-green-600">
                    {quote.status}
                  </span>
                </td>
                <td className="py-3 text-center">
              <button
                onClick={() => navigate(`/quotes/${quote._id}`)}
                  className="py-1.5 px-3 border shadow rounded-lg flex items-center gap-2 hover:bg-purple-50"
>
  Details
  <RightIcon />
              </button>
            </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <header className="bg-white">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link to="/customers" className="text-purple-600 hover:text-purple-800">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Customer Details</h1>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Two Column Layout: Customer Resume Left, Tabs Right */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Customer Resume */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <UserIcon />
                  <h2 className="text-lg font-medium text-[#030712]">Customer Information</h2>
                </div>
                {editingDetails ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDetails}
                      className="bg-purple-600 text-white text-sm px-3 py-1 rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingDetails(false)
                        setDetailsDraft({
                          name: customer.name,
                          subText: customer.subText,
                          email: customer.email,
                          phone: customer.phone,
                          address: customer.address,
                          imageUrl: customer.imageUrl
                        })
                      }}
                      className="text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingDetails(true)
                      setDetailsDraft({
                        name: customer.name,
                        subText: customer.subText,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        imageUrl: customer.imageUrl
                      })
                    }}
                  >
                    <EditIcon />
                  </button>
                )}
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#E6E6E6]">
                <div className="relative">
                  {customer.imageUrl || detailsDraft.imageUrl ? (
                    <img
                      src={customer.imageUrl || detailsDraft.imageUrl}
                      alt={customer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold ${customer.avatarColor || "bg-purple-600"} text-white`}>
                      {getInitials(customer.name)}
                    </div>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-1 -right-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-full p-1.5 transition-colors"
                    title="Upload image"
                  >
                    {uploadingImage ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                
                {editingDetails ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={detailsDraft.name}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      value={detailsDraft.subText}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, subText: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Sub Text"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-[#18181B] font-medium text-sm">{customer.name}</p>
                    {customer.subText && (
                      <p className="text-xs text-[#8E8C8F] mt-1">{customer.subText}</p>
                    )}
                  </div>
                )}
              </div>
              
              {imageError && (
                <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                  {imageError}
                </div>
              )}

              {/* Customer Details */}
              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">Email</label>
                  {editingDetails ? (
                    <input
                      type="email"
                      value={detailsDraft.email}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-[#18181B] font-medium mt-1">{customer.email}</p>
                  )}
                </div>

                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">Phone</label>
                  {editingDetails ? (
                    <input
                      type="text"
                      value={detailsDraft.phone}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-[#18181B] font-medium mt-1">{customer.phone}</p>
                  )}
                </div>

                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">Address</label>
                  {editingDetails ? (
                    <input
                      type="text"
                      value={detailsDraft.address}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-[#18181B] font-medium mt-1">{customer.address}</p>
                  )}
                </div>

                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">Customer Since</label>
                  <p className="text-[#18181B] font-medium mt-1">{formatDateToDMY(customer.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Billing Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-[#030712]">Billing Information</h2>
                {editingBilling ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBilling}
                      className="bg-purple-600 text-white text-sm px-3 py-1 rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingBilling(false)
                        setBillingDraft({
                          billingStreet: customer.billingStreet || '',
                          billingCity: customer.billingCity || '',
                          billingState: customer.billingState || '',
                          billingCountry: customer.billingCountry || '',
                          billingZip: customer.billingZip || ''                        })
                      }}
                      className="text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingBilling(true)
                      setBillingDraft({
                        billingStreet: customer.billingStreet || '',
                        billingCity: customer.billingCity || '',
                        billingState: customer.billingState || '',
                        billingCountry: customer.billingCountry || '',
                        billingZip: customer.billingZip || ''
                      })
                    }}
                  >
                    <EditIcon />
                  </button>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">Street Address</label>
                  {editingBilling ? (
                    <input
                      type="text"
                      value={billingDraft.billingStreet}
                      onChange={(e) => setBillingDraft({ ...billingDraft, billingStreet: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                      placeholder="Street address"
                    />
                  ) : (
                    <p className="text-[#18181B] font-medium mt-1">{customer.billingStreet || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">City</label>
                  {editingBilling ? (
                    <input
                      type="text"
                      value={billingDraft.billingCity}
                      onChange={(e) => setBillingDraft({ ...billingDraft, billingCity: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                      placeholder="City"
                    />
                  ) : (
                    <p className="text-[#18181B] font-medium mt-1">{customer.billingCity || '-'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-normal text-xs text-[#8E8C8F]">State</label>
                    {editingBilling ? (
                      <input
                        type="text"
                        value={billingDraft.billingState}
                        onChange={(e) => setBillingDraft({ ...billingDraft, billingState: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        placeholder="State"
                      />
                    ) : (
                      <p className="text-[#18181B] font-medium mt-1">{customer.billingState || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="font-normal text-xs text-[#8E8C8F]">Zip Code</label>
                    {editingBilling ? (
                      <input
                        type="text"
                        value={billingDraft.billingZip}
                        onChange={(e) => setBillingDraft({ ...billingDraft, billingZip: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        placeholder="Zip code"
                      />
                    ) : (
                      <p className="text-[#18181B] font-medium mt-1">{customer.billingZip || '-'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-normal text-xs text-[#8E8C8F]">Country</label>
                  {editingBilling ? (
                    <input
                      type="text"
                      value={billingDraft.billingCountry}
                      onChange={(e) => setBillingDraft({ ...billingDraft, billingCountry: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                      placeholder="Country"
                    />
                  ) : (
                    <p className="text-[#18181B] font-medium mt-1">{customer.billingCountry || '-'}</p>
                  )}
                </div>

                
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Notes</h2>
                <button
                  onClick={() => setEditingNotes(!editingNotes)}
                >
                  <EditIcon />
                </button>
              </div>
              {editingNotes ? (
                <>
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="8"
                    placeholder="Add notes about this customer..."
                  />
                  <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
                    <button
                      onClick={() => { setEditingNotes(false); setNotesDraft(customer.notes) }}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">{customer.notes || 'No notes added yet.'}</p>
              )}
            </div>
          </div>

          {/* Right Column: Tabs Section */}
          <div className="col-span-12 lg:col-span-8">
            <div className="space-y-4">
              {/* Tabs Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "overview"
                        ? "bg-[#240046] text-white"
                        : "bg-white text-[#030712] hover:bg-purple-50"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "events"
                        ? "bg-[#240046] text-white"
                        : "bg-white text-[#030712] hover:bg-purple-50"
                    }`}
                  >
                    Events
                  </button>
                  <button
                    onClick={() => setActiveTab("quotes")}
                    className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "quotes"
                        ? "bg-[#240046] text-white"
                        : "bg-white text-[#030712] hover:bg-purple-50"
                    }`}
                  >
                    Quotes
                  </button>
                  <button
                    onClick={() => setActiveTab("attachments")}
                    className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "attachments"
                        ? "bg-[#240046] text-white"
                        : "bg-white text-[#030712] hover:bg-purple-50"
                    }`}
                  >
                    Attachments
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "logs"
                        ? "bg-[#240046] text-white"
                        : "bg-white text-[#030712] hover:bg-purple-50"
                    }`}
                  >
                    Logs
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" ? (
                <CustomerOverview 
                  customer={customer} 
                  customerId={id}
                  onUpdate={handleCustomerUpdate}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="overflow-x-auto">{renderTable()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}