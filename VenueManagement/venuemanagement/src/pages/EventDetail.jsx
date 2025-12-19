import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import http from "../config/http";
import EventRecap from "../components/Event/EventRecap";
import EventDetails from "../components/Event/EventDetails";
import EventTabsSection from "../components/Event/EventTabsSection";
import bannerImg from "../assets/images/eventImage.png";
import profileImg from "../assets/images/profileImg.png";
import LocationIcon from "../assets/helperIcons/LocationIcon";
import CalenderIcon from "../assets/helperIcons/CalendarIcon";
import ThreeDotsHorizontalIcon from "../assets/helperIcons/ThreeDotsHorizontalIcon";
import ArrowRightBigIcon from "../assets/helperIcons/ArrowRightBigIcon";
import { useSettings } from '../contexts/SettingsContext';
import { formatDateTime } from '../utils/formatDate';


export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState({});
  const [expensesData, setExpensesData] = useState([]);
  const [incidentsData, setIncidentsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [attachmentsData, setAttachmentsData] = useState([]); // For attachments
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerOptions, setCustomerOptions] = useState([]);
  const settings = useSettings();
  useEffect(() => {
    // Fetch event data from the server
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await http.get(`/api/events/${id}`);
        console.log("Event data:", response.data);
        setEvent(response.data);
        setExpensesData(response.data?.related?.expenses || []);
        setStaffData(response.data?.related?.staff || []);
        setIncidentsData(response.data?.related?.incidents || []);
        setPaymentsData(response.data?.related?.payments || []);
        setInvoicesData(response.data?.related?.invoices || []);
        setAttachmentsData(response.data?.related?.attachments || []);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    // Fetch customer data for dropdown options
    const fetchCustomers = async () => {
      try {
        const response = await http.get("/api/customers");
        setCustomerOptions(response.data);
        console.log("Customer options:", response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  // Handle updates from child components
  const handleEventUpdate = async (section, updatedData) => {
    try {
      let updatePayload = {};

      if (section === "recap") {
        updatePayload = {
          status: updatedData.status,
          amount: updatedData.amount,
          pagado: updatedData.pagado,
          balance: updatedData.balance,
          cost: updatedData.cost,
          guests: updatedData.guests,
          date: updatedData.date,
        };

        // Update local state
        setEvent((prev) => ({ ...prev, ...updatePayload }));
      } else if (section === "details") {
        updatePayload = {
          customer: updatedData.customer,
          time: updatedData.time,
          eventType: updatedData.eventType,
          sillasType: updatedData.sillasType,
          mantelType: updatedData.mantelType,
          location: updatedData.location,
          foodType: updatedData.foodType,
          customFields: updatedData.customFields,
        };

        // Update local state
        setEvent((prev) => ({ ...prev, ...updatePayload }));
      }

      // Save to server
      await http.put(`/api/events/${id}`, {
        ...event,
        ...updatePayload,
      });

      console.log(`${section} updated successfully`);
    } catch (error) {
      console.error(`Error updating event ${section}:`, error);
      // Optionally show error message to user
      alert(`Error updating ${section}. Please try again.`);
    }
  };

  // Handle staff updates from EventTabsSection
  const handleStaffUpdate = (updatedStaffData) => {
    setStaffData(updatedStaffData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <header className="bg-white">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="border rounded-full w-[26px] h-[26px] flex justify-center items-center">
            <Link to="/events" className="">
              <ArrowRightBigIcon />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Event Management
            {/* {event.eventType && ` - ${event.eventType}`} */}
          </h1>
        </div>
      </header>

      {/* banner section */}

      <div className="relative mb-5">
        <img src={bannerImg} className="w-full h-full" alt="bannerImg" />
        <img
          src={profileImg}
          className="w-[78px] h-[78px] rounded-full border border-white border-[10px] bg-white absolute left-10 -bottom-10 z-10"
          alt="profileImg"
        />
      </div>

      <div className="px-6 py-6 pb-0 flex gap-3 items-end justify-between">
        <div>
          <h1 className="text-[32px] font-medium text-[#030712]">
            {event.name || "Unnamed Event"}
          </h1>
          <div className="flex gap-4 mt-1">
            <p className="text-sm font-medium text-[#8E8C8F] flex gap-2 items-center">
              <LocationIcon />{" "}
              <span>894 Elmwood Drive, Suite 250, San Mateo, CA 94402</span>
            </p>
            <p className="text-sm font-medium text-[#8E8C8F] flex gap-2 items-center">
              <CalenderIcon /> <span>Created {formatDateTime(event.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="py-2 px-3 border bg-[#240046] text-[#fff] rounded-md">
            Update Event
          </button>
          <button className="py-3 px-3 border bg-white rounded-md">
            <ThreeDotsHorizontalIcon />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 grid gap-6">
        {/* Recap & Details Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          <EventRecap event={event} onUpdate={handleEventUpdate} />

          <div className="xl:col-span-2">
            <EventDetails
              event={event}
              customerOptions={customerOptions}
              onUpdate={handleEventUpdate}
              settings={settings?.settings}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <EventTabsSection
          eventId={id}
          event={event}
          expensesData={expensesData}
          staffData={staffData}
          onStaffUpdate={handleStaffUpdate}
          incidentsData={incidentsData}
          paymentsData={paymentsData}
          invoicesData={invoicesData}
          attachmentsData={attachmentsData}
        />
      </div>
    </div>
  );
}
