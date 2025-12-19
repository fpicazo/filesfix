import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import http from "../config/http";
import PageHeader from "../components/PageHeader";
import EventDrawer from "../components/EventDrawer";
import { CustomTable } from "../components/Table/CustomTable";
import { formatDateToDMY } from "../utils/formatDate";
import RightIcon from "../assets/helperIcons/RightIcon";

export default function Events() {
  // State variables
  const [eventsList, setEventsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch events from the server when the component mounts
    const fetchEvents = async () => {
      try {
        const response = await http.get("/api/events");
        console.log("Events fetched successfully:", response.data);
        setEventsList(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    
    const fetchCustomers = async () => {
      try {
        const response = await http.get("/api/customers");
        setCustomersList(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    
    fetchCustomers();
    fetchEvents();
  }, []);

  // Form submission handler: update if editing, add new if not
  const handleFormSubmit = (formData) => {
    console.log("Form submitted " + selectedCustomer);
    const eventData = {
      name: formData.name,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      status: formData.status,
      description: formData.description,
      customerId: selectedCustomer,
      eventType: formData.eventType,
      guests: formData.guests,
    };
    
    if (editingEvent) {
      // Update existing event in local state
      setEventsList((prev) =>
        prev.map((event) => 
          event._id === editingEvent._id ? { ...event, ...eventData } : event
        )
      );
      // Update the event in the server
      http
        .put(`/api/events/${editingEvent._id}`, eventData)
        .then((response) => {
          console.log("Event updated successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error updating event:", error);
        });
    } else {
      // Add the event to the server first to get the complete object
      http
        .post("/api/events", eventData)
        .then((response) => {
          console.log("Event added successfully:", response.data);
          // Add new event with server response to local state
          setEventsList((prev) => [...prev, response.data]);
        })
        .catch((error) => {
          console.error("Error adding event:", error);
        });
    }
    
    setDrawerOpen(false);
    setEditingEvent(null);
    setSelectedCustomer(null);
  };

  const handleViewDetails = (id) => {
    navigate(`/events/${id}`);
  };

  const deleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      // Update local state using _id
      setEventsList((prev) => prev.filter((event) => event._id !== id));
      
      // Delete from server
      http
        .delete(`/api/events/${id}`)
        .then((response) => {
          console.log("Event deleted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error deleting event:", error);
        });
    }
  };

  const placeOptions = ["Jardín", "Salón"];
  const statusOptions = [
    "Pendiente",
    "Mandar cotización",
    "Vendido",
    "Planeado",
    "Pago retrasado",
    "Vencido",
    "Cancelado",
  ];
  const eventTypeOptions = ["Bautizo", "Boda", "Fiesta", "Bithday"];

  const columns = [
    {
      header: "Event",
      accessorKey: "name",
      cell: (props) => (
        <p className="text-gray-800 font-medium">{props.getValue()}</p>
      )
    },
    {
      header: "Location",
      accessorKey: "location",
      cell: (props) => (
        <p className="text-gray-800">{props.getValue()}</p>
      )
    },
    {
      header: "Customer",
      accessorKey: "customerId.name",
      cell: (props) => (
        <p className="text-gray-800">{props.getValue() || '-'}</p>
      )
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (props) => (
        <p className="text-gray-800">{formatDateToDMY(props.getValue())}</p>
      ),
      filterFn: "dateFilter",
      meta: { filterVariant: "date" }
    },
    {
      header: "Status",
      accessorKey: "status",
      meta: { filterVariant: "select", defaultLabel: "All Status" },
      cell: (props) => (
        <p className="text-gray-800">{props.getValue()}</p>
      )
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (props) => {
        const desc = props.getValue() || '';
        return (
          <p className="text-gray-800 truncate max-w-xs">
            {desc.length > 50 ? desc.slice(0, 50) + "..." : desc}
          </p>
        );
      },
      isHideSort: true
    },
    {
      header: "Action",
      isHideSort: true,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="View Details"
          >
            Details
            <RightIcon />
          </button>
          <button
            onClick={() => {
              setEditingEvent(row.original);
              setSelectedCustomer(
                row.original.customerId?._id || row.original.customerId || ""
              );
              setDrawerOpen(true);
            }}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Edit Event"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteEvent(row.original._id)}
            className="py-2 px-3 border shadow rounded-lg flex items-center gap-2"
            title="Delete Event"
          >
            <Trash size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <PageHeader title="Events" backPath="/">
      <div className="min-h-screen bg-purple-50">
        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <CustomTable
              data={eventsList}
              columns={columns}
              dataNotFoundQuery="No events found"
              additionalActions={
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setSelectedCustomer(null);
                    setDrawerOpen(true);
                  }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md font-medium text-sm shadow"
                >
                  <Plus className="h-4 w-4" />
                  Add New Event
                </button>
              }
            />
          </div>
        </div>

        {/* Drawer for Create/Edit Event */}
        {drawerOpen && (
          <EventDrawer
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setEditingEvent(null);
              setSelectedCustomer(null);
            }}
            onSubmit={handleFormSubmit}
            editingEvent={editingEvent}
            customersList={customersList}
            setSelectedCustomer={setSelectedCustomer}
            selectedCustomer={selectedCustomer}
            placeOptions={placeOptions}
            statusOptions={statusOptions}
            eventTypeOptions={eventTypeOptions}
          />
        )}
      </div>
    </PageHeader>
  );
}