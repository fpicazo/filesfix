import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Users,
  AlertTriangle,
  CreditCard,
  FileText,
  Paperclip,
  CreditCardIcon,
} from "lucide-react";
import { formatDateToDMY } from "../../utils/formatDate";
import http from "../../config/http";
import FileImport from "../shared/FileList";
import RightIcon from "../../assets/helperIcons/RightIcon";
import { CustomTable } from "../Table/CustomTable";

export default function EventTabsSection({
  eventId,
  event = {},
  expensesData = [],
  staffData = [],
  incidentsData = [],
  paymentsData = [],
  invoicesData = [],
  onStaffUpdate,
  attachmentsData = [],
}) {
  const [activeTab, setActiveTab] = useState("expenses");
  const [localStaffData, setLocalStaffData] = useState(staffData);
  const [availableStaff, setAvailableStaff] = useState([]);
  
  // Payment Plan states
  const [planType, setPlanType] = useState("");
  const [planRows, setPlanRows] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Get values from event
  const paymentPlan = event.related?.paymentPlan?.[0] || null;
  const eventTotal = event.amount || 0;
  const customerId = event.customerId?._id || event.customerId || event.customer || "";

  // Staff assignment states
  const [addingStaff, setAddingStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [newStaffAssignment, setNewStaffAssignment] = useState({
    staffId: "",
    role: "",
    scheduleStart: "",
    scheduleStop: "",
    paymentAmount: "",
    paymentStatus: "Pending",
  });

  const paymentStatusOptions = ["Pending", "Paid", "Partial", "Overdue"];

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Partial: "bg-blue-100 text-blue-800",
      Overdue: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      resolved: "bg-green-100 text-green-800",
      open: "bg-red-100 text-red-800",
      investigating: "bg-yellow-100 text-yellow-800",
      closed: "bg-gray-100 text-gray-800",
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getSeverityColor = (severity) => {
    return getStatusColor(severity);
  };

  useEffect(() => {
    setLocalStaffData(staffData);
  }, [staffData]);

  useEffect(() => {
    // Initialize payment plan from event if available
    if (paymentPlan) {
      setPlanName(paymentPlan.name || "");
      
      // Format payment detail dates from ISO to YYYY-MM-DD
      const formattedRows = (paymentPlan.paymentDetail || []).map(row => ({
        ...row,
        date: row.date ? row.date.split('T')[0] : ""
      }));
      setPlanRows(formattedRows);
      
      setStartDate(paymentPlan.startDate ? paymentPlan.startDate.split('T')[0] : "");
      setEndDate(paymentPlan.endDate ? paymentPlan.endDate.split('T')[0] : "");
      setPlanType("active"); // Set to active when loading existing plan
    }
  }, [paymentPlan]);

  useEffect(() => {
    // Fetch available staff
    const fetchStaff = async () => {
      try {
        const response = await http.get("/api/staff");
        setAvailableStaff(
          response.data.filter((staff) => staff.status === "Active")
        );
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, []);

  const getPaymentStatusColor = (status) => {
    return getStatusColor(status);
  };

  const handleAddStaff = async () => {
    if (!newStaffAssignment.staffId || !newStaffAssignment.role) {
      alert("Please select staff member and role");
      return;
    }

    try {
      const selectedStaff = availableStaff.find(
        (s) => s._id === newStaffAssignment.staffId
      );
      const staffAssignment = {
        ...newStaffAssignment,
        staffName: selectedStaff.name,
        paymentAmount: parseFloat(newStaffAssignment.paymentAmount) || 0,
      };

      // Add to local state
      const newAssignment = { ...staffAssignment, id: Date.now() };
      setLocalStaffData([...localStaffData, newAssignment]);

      // Save to server
      await http.post(`/api/events/${eventId}/staff`, staffAssignment);

      // Notify parent component
      onStaffUpdate && onStaffUpdate([...localStaffData, newAssignment]);

      // Reset form
      setNewStaffAssignment({
        staffId: "",
        role: "",
        scheduleStart: "",
        scheduleStop: "",
        paymentAmount: "",
        paymentStatus: "Pending",
      });
      setAddingStaff(false);
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const handleUpdateStaff = async (staffAssignmentId, updatedData) => {
    try {
      const updatedStaffData = localStaffData.map((staff) =>
        staff.id === staffAssignmentId ? { ...staff, ...updatedData } : staff
      );
      setLocalStaffData(updatedStaffData);

      await http.put(
        `/api/events/${eventId}/staff/${staffAssignmentId}`,
        updatedData
      );
      onStaffUpdate && onStaffUpdate(updatedStaffData);
      setEditingStaffId(null);
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleDeleteStaff = async (staffAssignmentId) => {
    if (
      window.confirm("Are you sure you want to remove this staff assignment?")
    ) {
      try {
        const updatedStaffData = localStaffData.filter(
          (staff) => staff.id !== staffAssignmentId
        );
        setLocalStaffData(updatedStaffData);
        await http.delete(`/api/events/${eventId}/staff/${staffAssignmentId}`);
        onStaffUpdate && onStaffUpdate(updatedStaffData);
      } catch (error) {
        console.error("Error deleting staff:", error);
      }
    }
  };

  const handleCancelAddStaff = () => {
    setAddingStaff(false);
    setNewStaffAssignment({
      staffId: "",
      role: "",
      scheduleStart: "",
      scheduleStop: "",
      paymentAmount: "",
      paymentStatus: "Pending",
    });
  };

  const typeColors = {
    Food: { bg: "#E9D1FF", text: "#240046" }, // 1
    Variable: { bg: "#D6E0FF", text: "#002AB3" }, // 2
    Fixed: { bg: "#FEEDD9", text: "#FB8500" }, // 3
    Office: { bg: "#D9DFD9", text: "#31572C" }, // 4
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "expenses":
        const columns = [
          {
            header: "Date",
            accessorKey: "date",
            cell: (props) => formatDateToDMY(props.getValue()),
            filterFn: "dateFilter",
            meta: { filterVariant: "date" },
          },

          {
            header: "Description",
            accessorKey: "description",
            cell: (props) =>
              props.getValue() && props.getValue()?.length > 20
                ? props.getValue().slice(0, 20) + "..."
                : props.getValue().slice(0, 20),
            isHideSort: true,
          },

          {
            header: "Expense Type",
            accessorKey: "type",
            cell: (props) => {
              const value = props.getValue();
              const colors = typeColors[value] || { bg: "#eee", text: "#333" };
              return (
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                  }}
                >
                  {value}
                </span>
              );
            },
            meta: { filterVariant: "select", defaultLabel: "All Events" },
          },

          {
            header: "Monto",
            accessorKey: "amount",
            cell: (props) => "$" + props.getValue(),
          },

          {
            header: "Action",
            isHideSort: true,
            cell: ({ row }) => (
              <div>
                <button className="py-2 px-3 border shadow rounded-lg flex items-center gap-2">
                  View Details
                  <RightIcon />
                </button>
              </div>
            ),
          },
        ];
        return (
          <CustomTable
            data={expensesData}
            columns={columns}
            dataNotFoundQuery="No expenses recorded for this event"
          />
          // <table className="w-full text-left text-sm">
          //   <thead>
          //     <tr className="border-b text-gray-500">
          //       <th className="py-2">Date</th>
          //       <th className="py-2">Monto</th>
          //       <th className="py-2">Type</th>
          //       <th className="py-2">Description</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     {expensesData.map((expense) => (
          //       <tr
          //         key={expense.id}
          //         className="border-b last:border-none hover:bg-purple-50 transition-colors"
          //       >
          //         <td className="py-3">{formatDateToDMY(expense.date)}</td>
          //         <td className="py-3">{expense.amount}</td>
          //         <td className="py-3">{expense.type}</td>
          //         <td className="py-3">{expense.description}</td>
          //       </tr>
          //     ))}
          //     {expensesData.length === 0 && (
          //       <tr>
          //         <td colSpan="4" className="py-6 text-center text-gray-500">
          //           No expenses recorded for this event
          //         </td>
          //       </tr>
          //     )}
          //   </tbody>
          // </table>
        );

      case "staff":
        // const StaffColumns = [
        //   {
        //     header: "Staff Name",
        //     accessorKey: "staffName",
        //   },

        //   {
        //     header: "Role",
        //     accessorKey: "role",
        //     meta: { filterVariant: "select", defaultLabel: "All Roles" },
        //   },

        //   {
        //     header: "Schedule Start",
        //     accessorKey: "scheduleStart",
        //   },

        //   {
        //     header: "Schedule Stop",
        //     accessorKey: "scheduleStop",
        //   },
        //   {
        //     header: "Payment Amount",
        //     accessorKey: "paymentAmount",
        //   },
        //   {
        //     header: "Payment Status",
        //     accessorKey: "paymentStatus",
        //     meta: { filterVariant: "select", defaultLabel: "All Status" },
        //   },

        //   {
        //     header: "Action",
        //     isHideSort: true,
        //     cell: ({ row }) => (
        //       <div>
        //         <button className="py-2 px-3 border shadow rounded-lg flex items-center gap-2">
        //           View Details
        //           <RightIcon />
        //         </button>
        //       </div>
        //     ),
        //   },
        // ];
        return (
          <>
            {/* <CustomTable
              data={localStaffData}
              columns={StaffColumns}
              dataNotFoundQuery="No staff assigned to this event"
            /> */}
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2">Staff Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Schedule Start</th>
                  <th className="py-2">Schedule Stop</th>
                  <th className="py-2">Payment Amount</th>
                  <th className="py-2">Payment Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {localStaffData.map((staff) => (
                  <tr
                    key={staff.id}
                    className="border-b last:border-none hover:bg-purple-50 transition-colors"
                  >
                    <td className="py-3 font-medium">{staff.staffName}</td>
                    <td className="py-3">
                      {editingStaffId === staff.id ? (
                        <input
                          type="text"
                          defaultValue={staff.role}
                          onBlur={(e) =>
                            handleUpdateStaff(staff.id, {
                              role: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : (
                        staff.role
                      )}
                    </td>
                    <td className="py-3">
                      {editingStaffId === staff.id ? (
                        <input
                          type="time"
                          defaultValue={staff.scheduleStart}
                          onBlur={(e) =>
                            handleUpdateStaff(staff.id, {
                              scheduleStart: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : (
                        staff.scheduleStart
                      )}
                    </td>
                    <td className="py-3">
                      {editingStaffId === staff.id ? (
                        <input
                          type="time"
                          defaultValue={staff.scheduleStop}
                          onBlur={(e) =>
                            handleUpdateStaff(staff.id, {
                              scheduleStop: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : (
                        staff.scheduleStop
                      )}
                    </td>
                    <td className="py-3">
                      {editingStaffId === staff.id ? (
                        <input
                          type="number"
                          defaultValue={staff.paymentAmount}
                          onBlur={(e) =>
                            handleUpdateStaff(staff.id, {
                              paymentAmount: parseFloat(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                        />
                      ) : (
                        `$${staff.paymentAmount}`
                      )}
                    </td>
                    <td className="py-3">
                      {editingStaffId === staff.id ? (
                        <select
                          defaultValue={staff.paymentStatus}
                          onBlur={(e) =>
                            handleUpdateStaff(staff.id, {
                              paymentStatus: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {paymentStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full shadow text-xs font-medium ${getPaymentStatusColor(
                            staff.paymentStatus
                          )}`}
                        >
                          {staff.paymentStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingStaffId(
                              editingStaffId === staff.id ? null : staff.id
                            )
                          }
                          className="text-[#030712] hover:text-purple-800"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Add New Staff Row */}
                {addingStaff && (
                  <tr className="border-b bg-gray-50">
                    <td className="py-3">
                      <select
                        value={newStaffAssignment.staffId}
                        onChange={(e) =>
                          setNewStaffAssignment({
                            ...newStaffAssignment,
                            staffId: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="">Select Staff</option>
                        {availableStaff.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        placeholder="Role"
                        value={newStaffAssignment.role}
                        onChange={(e) =>
                          setNewStaffAssignment({
                            ...newStaffAssignment,
                            role: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="time"
                        value={newStaffAssignment.scheduleStart}
                        onChange={(e) =>
                          setNewStaffAssignment({
                            ...newStaffAssignment,
                            scheduleStart: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="time"
                        value={newStaffAssignment.scheduleStop}
                        onChange={(e) =>
                          setNewStaffAssignment({
                            ...newStaffAssignment,
                            scheduleStop: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newStaffAssignment.paymentAmount}
                        onChange={(e) =>
                          setNewStaffAssignment({
                            ...newStaffAssignment,
                            paymentAmount: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        step="0.01"
                      />
                    </td>
                    <td className="py-3">
                      <select
                        value={newStaffAssignment.paymentStatus}
                        onChange={(e) =>
                          setNewStaffAssignment({
                            ...newStaffAssignment,
                            paymentStatus: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {paymentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddStaff}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={handleCancelAddStaff}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {localStaffData.length === 0 && !addingStaff && (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500">
                      No staff assigned to this event
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        );

      case "incidents":
        return (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Severity</th>
                <th className="py-2">Status</th>
                <th className="py-2">Reporter</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {incidentsData.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b last:border-none hover:bg-purple-50 transition-colors"
                >
                  <td className="py-3">{formatDateToDMY(incident.date)}</td>
                  <td className="py-3">{incident.type}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full shadow text-xs font-medium ${getSeverityColor(
                        incident.severity
                      )}`}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full shadow text-xs font-medium ${getStatusColor(
                        incident.status
                      )}`}
                    >
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-3">{incident.reporter}</td>
                  <td className="py-3">
                    {truncateText(incident.description, 50)}
                  </td>
                </tr>
              ))}
              {incidentsData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No incidents reported for this event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case "attachments":
        return (
          <FileImport
            module="events"
            parentId={eventId}
            files={attachmentsData}
          />
        );

      case "payments":
        return (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Type</th>
                <th className="py-2">Method</th>
                <th className="py-2">Status</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {paymentsData.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-none hover:bg-purple-50 transition-colors"
                >
                  <td className="py-3">{formatDateToDMY(payment.date)}</td>
                  <td className="py-3 font-medium">
                    <span
                      className={
                        payment.type === "received"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {payment.type === "received" ? "+" : "-"}
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full shadow text-xs font-medium ${
                        payment.type === "received"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.type}
                    </span>
                  </td>
                  <td className="py-3">{payment.method}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full shadow text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {truncateText(payment.description, 40)}
                  </td>
                </tr>
              ))}
              {paymentsData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No payments recorded for this event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case "invoices":
        return (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Invoice #</th>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Client/Vendor</th>
                <th className="py-2">Due Date</th>
                <th className="py-2">Status</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {invoicesData.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b last:border-none hover:bg-purple-50 transition-colors"
                >
                  <td className="py-3 font-medium text-[#030712]">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="py-3">{formatDateToDMY(invoice.date)}</td>
                  <td className="py-3 font-medium">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="py-3">{invoice.clientVendor}</td>
                  <td className="py-3">
                    <span
                      className={`${
                        new Date(invoice.dueDate) < new Date() &&
                        invoice.status !== "paid"
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {formatDateToDMY(invoice.dueDate)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full shadow text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {truncateText(invoice.description, 40)}
                  </td>
                </tr>
              ))}
              {invoicesData.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    No invoices created for this event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case "paymentPlan":
        return renderPaymentPlanContent();

      default:
        return null;
    }
  };

  // Payment Plan helper functions

  const handleStartCreatingPlan = () => {
    if (!planRows || planRows.length === 0) {
      setPlanRows([{ percentage: "", amount: "", date: "" }]);
      setPlanType("active");
    }
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...planRows];
    
    if (field === "date") {
      newRows[index].date = value;
      
      // Auto-set start date to the earliest payment date
      const allDates = newRows.filter(row => row.date).map(row => new Date(row.date));
      if (allDates.length > 0) {
        const earliestDate = new Date(Math.min(...allDates));
        setStartDate(earliestDate.toISOString().split('T')[0]);
      }
    } else if (field === "percentage" && value !== "") {
      const percentage = parseFloat(value);
      newRows[index].amount = parseFloat((eventTotal * percentage / 100).toFixed(2));
      newRows[index].percentage = percentage;
    } else if (field === "amount" && value !== "") {
      const amount = parseFloat(value);
      newRows[index].amount = amount;
      newRows[index].percentage = parseFloat(((amount / eventTotal) * 100).toFixed(2));
    } else {
      newRows[index][field] = value;
    }

    setPlanRows(newRows);
  };

  const addPlanRow = () => {
    setPlanRows([...planRows, { percentage: "", amount: "", date: "" }]);
  };

  const removePlanRow = (index) => {
    setPlanRows(planRows.filter((_, i) => i !== index));
  };

  const savePlanToServer = async () => {
    try {
      setSavingPlan(true);
      
      // Validate required fields
      if (!planName) {
        alert("Please enter a plan name");
        setSavingPlan(false);
        return;
      }
      
      if (!startDate) {
        alert("Please select a start date");
        setSavingPlan(false);
        return;
      }
      
      if (planRows.length === 0 || planRows.some(row => !row.date || !row.amount)) {
        alert("Please fill in all payment dates and amounts");
        setSavingPlan(false);
        return;
      }
      
      // Map rows to paymentDetail format (only date and amount)
      const paymentDetail = planRows.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount)
      }));
      
      await http.post(`/api/events/${eventId}/payments`, {
        name: planName,
        amount: eventTotal,
        paymentDetail: paymentDetail,
        startDate: startDate,
        endDate: endDate || undefined,
        customerId: customerId,
        eventId: eventId
      });
      
      alert("Payment plan saved successfully!");
      
      // Note: Parent component should refetch event data to get updated paymentPlan
      // The event.paymentPlan will be updated on next page load or parent refresh
    } catch (error) {
      console.error("Error saving payment plan:", error);
      alert("Error saving payment plan: " + (error.response?.data?.message || error.message));
    } finally {
      setSavingPlan(false);
    }
  };

  const renderPaymentPlanContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Payment Plan</h3>
          <div className="text-sm text-gray-600">
            Event Total: <span className="font-semibold">{formatCurrency(eventTotal)}</span>
          </div>
        </div>

        {/* Plan Details */}
        {!planType && !paymentPlan ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No payment plan created yet</p>
            <button
              onClick={handleStartCreatingPlan}
              className="px-6 py-3 bg-[#240046] text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              Create Payment Plan
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter plan name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Auto-calculated from first payment)
                </label>
                <input
                  type="date"
                  value={startDate}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Payment Plan Table */}
        {planType && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Payment Date *</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Percentage (%)</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Amount *</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {planRows.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="date"
                        value={row.date || ""}
                        onChange={(e) => handleRowChange(index, "date", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={row.percentage || ""}
                        onChange={(e) => handleRowChange(index, "percentage", e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="%"
                        step="0.01"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={row.amount || ""}
                        onChange={(e) => handleRowChange(index, "amount", e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Amount"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removePlanRow(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={planRows.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="py-3 px-4 font-semibold">Total</td>
                  <td className="py-3 px-4 font-semibold">
                    {planRows.reduce((sum, row) => sum + (parseFloat(row.percentage) || 0), 0).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {formatCurrency(planRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0))}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

            {/* Action Buttons */}
            {planType && (
              <div className="flex gap-3">
                <button
                  onClick={addPlanRow}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment
                </button>
                <button
                  onClick={savePlanToServer}
                  disabled={savingPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-[#240046] text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                >
                  {savingPlan ? "Saving..." : "Save Payment Plan"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-3 mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "expenses"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-[240046]"
            }`}
          >
            {/* <CreditCardIcon className="h-4 w-4" /> */}
            Expenses
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "staff"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-purple-50"
            }`}
          >
            {/* <Users className="h-4 w-4" /> */}
            Staff
          </button>
          <button
            onClick={() => setActiveTab("incidents")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "incidents"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-purple-50"
            }`}
          >
            {/* <AlertTriangle className="h-4 w-4" /> */}
            Incidents
          </button>
          <button
            onClick={() => setActiveTab("attachments")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "attachments"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-purple-50"
            }`}
          >
            {/* <Paperclip className="h-4 w-4" /> */}
            Attachments
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "payments"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-purple-50"
            }`}
          >
            {/* <CreditCard className="h-4 w-4" /> */}
            Payments
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "invoices"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-purple-50"
            }`}
          >
            {/* <FileText className="h-4 w-4" /> */}
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("paymentPlan")}
            className={`px-3 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "paymentPlan"
                ? "bg-[#240046] text-white"
                : "bg-white text-[#030712] hover:bg-purple-50"
            }`}
          >
            Payment Plan
          </button>
        </div>
        {activeTab === "staff" && (
          <button
            onClick={() => setAddingStaff(true)}
            className="flex items-center gap-2 bg-[#240046] hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow font-medium text-sm"
          >
            {/* <Plus className="h-4 w-4" /> */}
            Assign Staff
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Tab Headers */}

        {/* Tab Content */}
        <div className="overflow-x-auto">{renderTabContent()}</div>
      </div>
    </div>
  );
}
