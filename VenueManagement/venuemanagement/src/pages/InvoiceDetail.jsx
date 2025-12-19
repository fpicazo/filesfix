import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  Send,
  Save,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Info,
  Dot,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import http from "../config/http";
import FileImport from "../components/shared/FileList";
import HomeIcon from "../assets/helperIcons/HomeIcon";
import EditIcon from "../assets/helperIcons/EditIcon";
import RightIcon from "../assets/helperIcons/RightIcon";
import CustomDatePicker from "../components/CustomDatePicker";
import CalenderIcon from "../assets/helperIcons/CalendarIcon";
import ArrowDownIcon from "../assets/helperIcons/ArrowDownIcon";
import dayjs from "dayjs";
import SendIcon from "../assets/helperIcons/SendIcon";
import SaveIcon from "../assets/helperIcons/SaveIcon";
import ProcessPaymentIcon from "../assets/helperIcons/ProcessPaymentIcon";
import CalenderBigIcon from "../assets/helperIcons/CalenderBigIcon";
import DateTimeIcon from "../assets/helperIcons/DateTimeIcon";
import ClockIcon from "../assets/helperIcons/ClockIcon";
import UserIcon from "../assets/helperIcons/UserIcon";
import CalenderCheckIcon from "../assets/helperIcons/CalenderCheckIcon";
import ShareIcon from "../assets/helperIcons/ShareIcon";
import ServiceIcon from "../assets/helperIcons/ServiceIcon";
import DeleteIcon from "../assets/helperIcons/DeleteIcon";
import CheckRoundIcon from "../assets/helperIcons/CheckRoundIcon";
import SwipeIcon from "../assets/helperIcons/SwipeIcon";
import CustomDropdown from "../components/CustomDropdown";
import AdditionalInfoIcon from "../assets/helperIcons/AdditionalInfoIcon";
import ResizeIcon from "../assets/helperIcons/ResizeIcon";
import ContactInfoIcon from "../assets/helperIcons/ContactInfoIcon";
import LinkIcon from "../assets/helperIcons/LinkIcon";
import InvoiceSummaryIcon from "../assets/helperIcons/InvoiceSummaryIcon";
import PaymentHistoryIcon from "../assets/helperIcons/PaymentHistoryIcon";
import { useSettings } from "../contexts/SettingsContext";

export default function InvoiceDetailPage() {
  const { settings } = useSettings();
  const fiscalEnabled = settings?.fiscalEnabled ?? false;
  
  // Debug logging
  console.log('Settings object:', settings);
  console.log('fiscalEnabled value:', fiscalEnabled);
  console.log('typeof fiscalEnabled:', typeof fiscalEnabled);
  
  const { id } = useParams(); // Get invoice ID from URL
  const navigate = useNavigate();
  const isNewInvoice = !id || id === "new";

  // Loading states
  const [loading, setLoading] = useState(!isNewInvoice);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [fetchingPayments, setFetchingPayments] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(true);

  // State for invoice data (matches MongoDB schema)
  const [invoice, setInvoice] = useState({
    invoiceNumber: "",
    serie: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    customerId: "",
    customerName: "",
    customerEmail: "",
    billingAddress: "",
    eventId: "",
    status: "draft",
    taxRate: 16,
    taxName: "IVA",
    notes: "",
    terms: "",
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    totalPaid: 0,
    remainingBalance: 0,
    mx_usage: "G03",
    forma_de_pago: "99",
    metodo_de_pago: "PUE",
  });

  const taxOptions = [
    { value: 0, label: "No Tax (0%)", name: "No Tax" },
    { value: 16, label: "VAT (16%)", name: "VAT" },
    { value: 8.5, label: "Sales Tax (8.5%)", name: "Sales Tax" },
    { value: 21, label: "Standard Rate (21%)", name: "Standard Rate" },
  ];
  // State for invoice items
  const [items, setItems] = useState([]);

  // State for related data
  const [events, setEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);

  // State for editing items
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    productId: "",
    description: "",
    quantity: 1,
    rate: 0,
  });

  // State for payments (fetched from separate Payment model)
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);

  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    type: "Payment",
    date: new Date().toISOString().split("T")[0],
    method: "Credit Card",
    amount: "",
    reference: "",
    notes: "",
  });

  // State for product creation modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sku: "",
  });

  // State for package modals
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [selectedPackageProducts, setSelectedPackageProducts] = useState([]);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    products: [],
    totalPrice: 0,
    category: "",
  });

  // visibility states
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showInvoiceNumberEdit, setShowInvoiceNumberEdit] = useState(false);
  const [selectEventOpen, setSelectEventOpen] = useState(false);

  // console.log("selectedDate:->", selectedDate);

  const handleCalendar = (value) => {
    switch (value) {
      case "invoice":
        return setShowInvoiceDatePicker(!showInvoiceDatePicker);
      case "due":
        return setShowDueDatePicker(!showDueDatePicker);
      default:
        return setShowInvoiceDatePicker(!showInvoiceDatePicker);
    }
  };

  const handleDateChange = (value, date) => {
    switch (value) {
      case "invoice":
        return setInvoice({
          ...invoice,
          invoiceDate: date,
        });
      case "due":
        return setInvoice({
          ...invoice,
          dueDate: date,
        });
      default:
        return setShowInvoiceDatePicker(!showInvoiceDatePicker);
    }
  };

  const handleTaxChange = (value) => {
    const selectedTax = taxOptions.find(
      (tax) => tax.value === parseFloat(value)
    );
    setInvoice({
      ...invoice,
      taxRate: parseFloat(value),
      taxName: selectedTax ? selectedTax.name : "Custom Tax",
    });
  };

  // Fetch invoice data on component mount
  useEffect(() => {
    if (isNewInvoice) {
      // Generate new invoice number for new invoices
      generateInvoiceNumber();
      fetchCustomers();
      fetchEvents();
      fetchProducts();
      fetchPackages();
    } else {
      fetchInvoiceData();
    }
  }, [id]);

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await http.get("/api/customers");
      console.log("Fetched customers:", response.data);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await http.get("/api/products");
      console.log("Fetched products:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await http.get("/api/packages");
      console.log("Fetched packages:", response.data);
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  // Fetch events for dropdown
  const fetchEvents = async () => {
    try {
      const response = await http.get("/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Generate new invoice number
  const generateInvoiceNumber = async () => {
    try {
      const response = await http.post("/api/invoices/generate-number");
      setInvoice((prev) => ({
        ...prev,
        invoiceNumber: response.data.invoiceNumber,
        serie: response.data.serie,
      }));
    } catch (error) {
      console.error("Error generating invoice number:", error);
      // Fallback to client-side generation
      const timestamp = Date.now().toString().slice(-3);
      setInvoice((prev) => ({
        ...prev,
        invoiceNumber: timestamp,
        serie: "INV",
      }));
    }
  };

  // Fetch invoice data for editing
  const fetchInvoiceData = async () => {
    try {
      setLoading(true);

      // Fetch invoice with populated data
      const response = await http.get(
        `/api/invoices/${id}?populate=eventId,customerId`
      );
      const invoiceData = response.data;

      console.log("Fetched invoice data:", invoiceData);

      // Set invoice data
      setInvoice({
        ...invoiceData,
        invoiceDate: invoiceData.invoiceDate?.split("T")[0] || "",
        dueDate: invoiceData.dueDate?.split("T")[0] || "",
        // Extract _id if eventId is populated as object
        eventId: typeof invoiceData.eventId === 'object' && invoiceData.eventId?._id 
          ? invoiceData.eventId._id 
          : invoiceData.eventId || "",
      });

      // Set items
      setItems(invoiceData.items || []);

      // Set event details if exists and it's an object
      if (invoiceData.eventId && typeof invoiceData.eventId === 'object') {
        setEventDetails(invoiceData.eventId);
      }

      // Fetch payments separately
      await fetchPayments(id);

      // Fetch related data for dropdowns
      await fetchCustomers();
      await fetchEvents();
      await fetchProducts();
      await fetchPackages();
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      alert("Error loading invoice data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments for this invoice
  const fetchPayments = async (invoiceId) => {
    try {
      setFetchingPayments(true);
      const response = await http.get(`/api/payments?invoiceId=${invoiceId}`);
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setFetchingPayments(false);
    }
  };

  // Fetch event details when eventId changes
  useEffect(() => {
    // Only fetch if eventId is a string (not already populated) and we don't have it in eventDetails
    if (invoice.eventId && typeof invoice.eventId === 'string' && invoice.eventId !== eventDetails?._id) {
      fetchEventDetails(invoice.eventId);
    }
  }, [invoice.eventId, eventDetails]);

  const fetchEventDetails = async (eventId) => {
    console.log("Fetching details for eventId:", eventId);
    try {
      const response = await http.get(`/api/events/${eventId}`);
      setEventDetails(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = total - totalPaid;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Handle product selection for existing items
  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      updateItem(index, "productId", productId);
      updateItem(index, "description", selectedProduct.name);
      updateItem(index, "rate", selectedProduct.price);
      updateItem(index, "codigoSat", selectedProduct.codigoSat || "");
      updateItem(index, "unidadSat", selectedProduct.unidadSat || "");
    } else {
      updateItem(index, "productId", "");
    }
  };

  // Handle product selection for new item
  const handleNewItemProductSelect = (productId) => {
    if (productId === "add_new") {
      setShowProductModal(true);
      return;
    }

    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        productId: productId,
        description: selectedProduct.name,
        rate: selectedProduct.price,
        codigoSat: selectedProduct.codigoSat || "",
        unidadSat: selectedProduct.unidadSat || "",
      });
    } else {
      setNewItem({
        ...newItem,
        productId: "",
        description: "",
        rate: 0,
        codigoSat: "",
        unidadSat: "",
      });
    }
  };

  // Handle item updates
  const updateItem = (index, field, value) => {
    setItems(
      items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add new item
  const addItem = () => {
    if (newItem.description) {
      const item = {
        ...newItem,
        amount: newItem.quantity * newItem.rate,
      };
      setItems([...items, item]);
      setNewItem({ productId: "", description: "", quantity: 1, rate: 0 });
    }
  };

  // Delete item
  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Package functions
  const addPackage = () => {
    setShowPackageModal(true);
  };

  const handlePackageSelect = (packageData) => {
    if (!packageData.products || packageData.products.length === 0) {
      alert("This package has no products defined");
      return;
    }

    // Create description with list of included items
    const itemNames = packageData.products
      .map((p) => (p.product ? p.product.name : "Unknown Item"))
      .join(", ");
    const packageDescription = `${packageData.name} - Includes: ${itemNames}`;

    // Calculate total package price (could be different from sum of individual products)
    const packagePrice =
      packageData.totalPrice ||
      packageData.products.reduce((sum, p) => {
        return sum + (p.product ? p.product.price * p.quantity : 0);
      }, 0);

    // Add package as a single line item
    const packageItem = {
      productId: null, // No specific product ID for packages
      packageId: packageData._id,
      description: packageDescription,
      quantity: 1,
      rate: packagePrice,
      amount: packagePrice,
      isPackage: true,
    };

    setItems([...items, packageItem]);
    setShowPackageModal(false);
  };

  const toggleProductInPackage = (productId) => {
    const isSelected = selectedPackageProducts.some(
      (p) => p.productId === productId
    );

    if (isSelected) {
      setSelectedPackageProducts(
        selectedPackageProducts.filter((p) => p.productId !== productId)
      );
    } else {
      const product = products.find((p) => p._id === productId);
      if (product) {
        setSelectedPackageProducts([
          ...selectedPackageProducts,
          {
            productId: productId,
            product: product,
            quantity: 1,
          },
        ]);
      }
    }
  };

  const updatePackageProductQuantity = (productId, quantity) => {
    setSelectedPackageProducts(
      selectedPackageProducts.map((p) =>
        p.productId === productId
          ? { ...p, quantity: parseInt(quantity) || 1 }
          : p
      )
    );
  };

  const calculatePackageTotal = () => {
    return selectedPackageProducts.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    );
  };

  const createPackage = async () => {
    if (!newPackage.name || selectedPackageProducts.length === 0) {
      alert("Please enter a package name and select at least one product");
      return;
    }

    try {
      const packageData = {
        ...newPackage,
        products: selectedPackageProducts,
        totalPrice: newPackage.totalPrice || calculatePackageTotal(),
      };

      const response = await http.post("/api/packages", packageData);

      // Add to packages list
      setPackages([...packages, response.data]);

      // Reset form and close modal
      setNewPackage({
        name: "",
        description: "",
        products: [],
        totalPrice: 0,
        category: "",
      });
      setSelectedPackageProducts([]);
      setShowCreatePackageModal(false);

      alert("Package created successfully!");
    } catch (error) {
      console.error("Error creating package:", error);
      alert(
        "Error creating package: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Product creation functions
  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill in required fields (name and price)");
      return;
    }

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
      };

      const response = await http.post("/api/products", productData);

      // Add to products list
      setProducts([...products, response.data]);

      // Select the new product in the new item
      setNewItem({
        ...newItem,
        productId: response.data._id,
        description: response.data.name,
        rate: response.data.price,
      });

      // Reset form and close modal
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        sku: "",
      });
      setShowProductModal(false);

      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      alert(
        "Error creating product: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Payment functions
  const addPayment = async () => {
    if (newPayment.amount && parseFloat(newPayment.amount) > 0) {
      try {
        // Generate payment number first
        const generateResponse = await http.post('/api/payments/generate-number');
        
        const paymentData = {
          type: newPayment.type,
          date: newPayment.date,
          method: newPayment.method,
          amount: parseFloat(newPayment.amount),
          reference: newPayment.reference,
          notes: newPayment.notes,
          invoiceId: invoice._id,
          customerId: invoice.customerId,
          serie: generateResponse.data.serie || '',
          paymentNumber: generateResponse.data.paymentNumber || '',
        };

        const response = await http.post("/api/payments", paymentData);
        setPayments([...payments, response.data]);
        setNewPayment({
          type: "Payment",
          date: new Date().toISOString().split("T")[0],
          method: "Credit Card",
          amount: "",
          reference: "",
          notes: "",
        });
        setShowPaymentModal(false);

        // Recalculate invoice totals
        await recalculateInvoiceTotals();
      } catch (error) {
        console.error("Error adding payment:", error);
        // Error message will be shown by axios interceptor
      }
    }
  };

  const deletePayment = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await http.delete(`/api/payments/${paymentId}`);
        setPayments(payments.filter((payment) => payment._id !== paymentId));

        // Recalculate invoice totals
        await recalculateInvoiceTotals();
      } catch (error) {
        console.error("Error deleting payment:", error);
        alert("Error deleting payment");
      }
    }
  };

  // Recalculate invoice totals after payment changes
  const recalculateInvoiceTotals = async () => {
    try {
      await http.put(`/api/invoices/${invoice._id}/recalculate`);
      // Refresh invoice data
      if (!isNewInvoice) {
        await fetchInvoiceData();
      }
    } catch (error) {
      console.error("Error recalculating totals:", error);
    }
  };

  // Save invoice function
  const saveInvoice = async () => {
    try {
      setSaving(true);

      const invoiceData = {
        ...invoice,
        items: items.map((item) => ({
          productId: item.productId || null,
          packageId: item.packageId || null,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          isPackage: item.isPackage || false,
          codigoSat: item.codigoSat || "",
          unidadSat: item.unidadSat || "",
        })),
      };

      let response;
      if (isNewInvoice) {
        // Create new invoice
        response = await http.post("/api/invoices", invoiceData);
        // Redirect to edit page after creation
        navigate(`/invoices/${response.data._id}`);
      } else {
        // Update existing invoice
        response = await http.put(`/api/invoices/${id}`, invoiceData);
        setInvoice(response.data);
      }

      alert("Invoice saved successfully!");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(
        "Error saving invoice: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Send invoice
  const sendInvoice = async () => {
    try {
      if (isNewInvoice) {
        alert("Please save the invoice first");
        return;
      }

      await http.post(`/api/invoices/${id}/send`);
      setInvoice((prev) => ({ ...prev, status: "sent" }));
      alert("Invoice sent successfully!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert("Error sending invoice");
    }
  };

  // Timbrar invoice
  const timbrarInvoice = async () => {
    try {
      if (isNewInvoice) {
        alert("Please save the invoice first");
        return;
      }

      // Build jsonInvoice from current invoice and items data
      const jsonInvoice = {
        invoice: invoice,
        items: items,
        invoiceNumber: invoice.invoiceNumber,
        serie: invoice.serie
      };

      console.log('Sending timbrar request with:', { id: invoice._id, jsonInvoice });

      const response = await http.post('/api/invoices/timbrar', {
        id: invoice._id,
        jsonInvoice: jsonInvoice
      });
      
      console.log('Timbrado exitoso:', response.data);
      alert('Factura timbrada exitosamente');
      
      // Refresh invoice data
      await fetchInvoiceData();
    } catch (error) {
      console.error('Error al timbrar:', error);
      alert('Error al timbrar la factura: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle navigation actions
  const handleBack = () => navigate("/invoices");
  const handlePreview = () => {
    // Open preview in new tab or modal
    window.open(`/invoices/${id}/preview`, "_blank");
  };
  const handleSend = sendInvoice;
  const handleSave = saveInvoice;
  const handlePayment = () => setShowPaymentModal(true);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Loading invoice...</div>
      </div>
    );
  }

  const actions = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          disabled={isNewInvoice}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>
        <button
          onClick={handleSend}
          disabled={isNewInvoice || saving}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon />
          Send
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={timbrarInvoice}
          disabled={isNewInvoice}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isNewInvoice ? 'Timbrar Factura' : 'Guarde la factura primero'}
        >
          <CreditCard className="h-3 w-3" />
          Timbrar
        </button>
        <button
          onClick={handlePayment}
          disabled={isNewInvoice}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SaveIcon />
          Process
        </button>
      </div>
    </div>
  );

  return (
    <PageHeader title="Edit Invoice" backPath="/Invoices" actions={actions}>
      <div className="min-h-screen">
        {/* Main Content */}
        <div className="px-4 py-4">
          {/* Invoice Details */}
          <div className="flex gap-[8px] items-center">
            <Link to="/">
              <HomeIcon />
            </Link>
            <div>
              <RightIcon color="#D4D4D5" />
            </div>
            <Link
              to="/invoices"
              className="block text-sm font-medium text-textLight"
            >
              Invoices
            </Link>
            <div>
              <RightIcon color="#D4D4D5" />
            </div>
            <p className="text-textDark font-medium text-sm">
              {invoice?.serie}{invoice?.invoiceNumber}
            </p>
          </div>

          <div className="flex gap-[12px] items-center mt-3">
            {showInvoiceNumberEdit ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={invoice.serie}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      serie: e.target.value,
                    })
                  }
                  className="w-[100px] text-[32px] border border-gray-300 rounded p-0 focus:outline-none focus:ring-1 focus:ring-purple-500 border-0 font-medium"
                  placeholder="Serie"
                />
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      invoiceNumber: e.target.value,
                    })
                  }
                  className="w-[150px] text-[32px] border border-gray-300 rounded p-0 focus:outline-none focus:ring-1 focus:ring-purple-500 border-0 font-medium"
                  placeholder="Number"
                />
              </div>
            ) : (
              <h2 className="text-[32px] text-textDark font-medium">
                {invoice?.serie}-{invoice?.invoiceNumber}
              </h2>
            )}

            <button
              className="border rounded-md p-[7px]"
              onClick={() => setShowInvoiceNumberEdit(!showInvoiceNumberEdit)}
            >
              <EditIcon color="#8E8C8F" />
            </button>
          </div>

          {/* actions */}
          <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              {/* issue date */}
              <div className="relative">
                <div
                  className="flex flex-row items-center gap-2 cursor-pointer"
                  onClick={() => handleCalendar("invoice")}
                >
                  <CalenderIcon color="#8E8C8F" />
                  <p className="text-textLight text-sm">Issued on</p>
                  <p className="text-textDark font-medium text-sm">
                    {dayjs(invoice?.invoiceDate).format("DD MMM YYYY")}
                  </p>
                  {showInvoiceDatePicker ? (
                    <span className="-rotate-180">
                      <ArrowDownIcon color="#240046" />
                    </span>
                  ) : (
                    <ArrowDownIcon color="#AEADAF" />
                  )}
                </div>

                {showInvoiceDatePicker && (
                  <div className="absolute z-50 top-full mt-2 right-0 w-full">
                    <CustomDatePicker
                      selectedDate={invoice?.invoiceDate}
                      onChange={(date) => handleDateChange("invoice", date)}
                      onClose={() => setShowInvoiceDatePicker(false)}
                    />
                  </div>
                )}
              </div>
              {/* due date */}
              <div className="relative">
                <div
                  className="flex flex-row items-center gap-2 cursor-pointer"
                  onClick={() => handleCalendar("due")}
                >
                  <DateTimeIcon color="#8E8C8F" />
                  <p className="text-textLight text-sm">Due by</p>
                  <p className="text-textDark font-medium text-sm">
                    {dayjs(invoice?.dueDate).format("DD MMM YYYY")}
                  </p>
                  {showDueDatePicker ? (
                    <span className="-rotate-180">
                      <ArrowDownIcon color="#240046" />
                    </span>
                  ) : (
                    <ArrowDownIcon color="#AEADAF" />
                  )}
                </div>

                {showDueDatePicker && (
                  <div className="absolute z-50 top-full mt-2 right-0 w-full">
                    <CustomDatePicker
                      selectedDate={invoice?.dueDate}
                      onChange={(date) => handleDateChange("due", date)}
                      onClose={() => setShowDueDatePicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handlePreview}
                disabled={isNewInvoice}
                className="flex bg-[#fff] items-center gap-1 py-[8px] px-[12px] text-sm text-black border border-[#EBEBEB] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Eye className="h-4 w-4 text-[#8E8C8F]" />
              </button>
              <button
                onClick={handleSend}
                disabled={isNewInvoice || saving}
                className="flex bg-[#fff] items-center gap-1 py-[8px] px-[16px] text-sm text-black border border-[#EBEBEB] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <span>
                  <SendIcon color="#8E8C8F" />
                </span>
                <span>Send</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex bg-[#fff] items-center gap-1 py-[8px] px-[16px] text-sm text-black border border-[#EBEBEB] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <SaveIcon />
                {saving ? "Saving..." : "Save"}
              </button>
              {fiscalEnabled && (
                <button
                  onClick={timbrarInvoice}
                  disabled={isNewInvoice}
                  className="flex items-center gap-1 py-[8px] px-[16px] text-sm border border-[#EBEBEB] rounded disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-blue-600 text-white hover:bg-blue-700"
                  title={!isNewInvoice ? 'Timbrar Factura' : 'Guarde la factura primero'}
                >
                  <CreditCard className="h-4 w-4" />
                  Timbrar
                </button>
              )}
              <button
                onClick={handlePayment}
                disabled={isNewInvoice}
                className="flex items-center gap-1 py-[8px] px-[16px] text-sm border border-[#EBEBEB] rounded  disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-primary text-white"
              >
                <ProcessPaymentIcon />
                Process Payment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_400px] gap-4 pt-4">
            {/* Left Column - Form Content */}
            <div className="flex flex-col gap-4">
              {/* Event Information - More Compact */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-textDark flex gap-2 items-center">
                    <CalenderBigIcon /> Event Information
                  </h3>
                  <button
                    onClick={() => setShowEventDetails((prev) => !prev)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {showEventDetails ? (
                      <Info className="w-4 h-4 text-primary" />
                    ) : (
                      <Info className="w-4 h-4" color="#AEADAF" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Select Event{" "}
                      <span className="text-[#C0BFC1]">(Optional)</span>
                    </label>
                    <div className="relative w-full">
                      <select
                        value={invoice.eventId}
                        onChange={(e) => {
                          setInvoice({ ...invoice, eventId: e.target.value });
                          setSelectEventOpen(false);
                        }}
                        onFocus={() => setSelectEventOpen(true)} // Open state
                        onBlur={() => setSelectEventOpen(false)} // Close state
                        className="appearance-none w-full border border-[#EBEBEB] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-0 focus:ring-[#EBEBEB] pr-10 text-red shadow-sm"
                        style={{ color: "#171717" }}
                      >
                        <option value="" className="text-gray-400">
                          No Event Selected
                        </option>
                        {events.map((event) => (
                          <option key={event._id} value={event._id}>
                            {event.eventType}
                            {" ("}
                            {dayjs(event?.date).format("DD MMMM YYYY")}
                            {")"} - {event.location}
                          </option>
                        ))}
                      </select>

                      {/* Custom arrow */}
                      <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {selectEventOpen ? (
                          // Arrow up (when open)
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          // Arrow down (when closed)
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Show event details if selected */}
                  {eventDetails && showEventDetails && (
                    <>
                      <div className="bg-[#F7F7F8] border border-[#E6E6E6] rounded grid grid-cols-2 text-sm [&_label]:font-normal [&_label]:text-xs [&_label]:text-[#8E8C8F] [&_p]:text-[#18181B] [&_p]:font-medium [&_p]:mt-1 [&_p]:text-sm [&_p]:flex [&_p]:gap-2 [&_p]:items-center ">
                        <div className="py-3 px-4">
                          <label>Event Name</label>
                          <p>{eventDetails?.name || "N/A"}</p>
                        </div>

                        <div className="py-3">
                          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
                            <label>Event Date</label>
                            <p>
                              <CalenderCheckIcon />{" "}
                              {eventDetails?.date ? dayjs(eventDetails.date).format("MMM DD, YYYY") : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="py-3 px-4 border-t border-[#E6E6E6]">
                          <label>Booking Time Slot</label>
                          <p>
                            <ClockIcon /> {eventDetails?.time || "N/A"}
                          </p>
                        </div>

                        <div className="py-3 border-t border-[#E6E6E6]">
                          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
                            <label>Guests</label>
                            <p><UserIcon /> {eventDetails?.guests || "N/A"}</p>
                          </div>
                        </div>

                        <div className="py-3 px-4 border-t border-[#E6E6E6]">
                          <label>Location</label>
                          <p>{eventDetails?.location || "N/A"}</p>
                        </div>

                        <div className="py-3 border-t border-[#E6E6E6]">
                          <div className="pl-4 border-l border-[#B7B8BD33] h-full">
                            <label>Event Type</label>
                            <p>{eventDetails?.eventType || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between gap-2 flex-wrap mt-4">
                        <p className="text-sm text-[#8E8C8F] flex gap-2 items-center">
                          <ClockIcon />{" "}
                          <span>
                            Last Updated{" "}
                            {dayjs(eventDetails?.updatedAt).format(
                              "DD MMMM YYYY hh:mm A"
                            )}
                          </span>
                        </p>
                        <Link
                          href={`/events/${eventDetails?._id}`}
                          target="_blank"
                          className="text-sm text-[#240046] flex gap-2 items-center"
                        >
                          View Event Details <ShareIcon color="#240046" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Services & Items - Enhanced with Product and Package Selection */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-textDark flex gap-2 items-center">
                    <ServiceIcon /> Services & Items
                  </h3>
                  <button
                    onClick={addPackage}
                    className="flex bg-[#fff] items-center gap-1 py-[8px] px-[16px] text-sm text-[#5C5C5C] border border-[#EBEBEB] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Plus className="h-3 w-3 text-[#5C5C5C]" />
                    Create New Package
                  </button>
                </div>

                <div className=" rounded-lg border border-[#E6E6E6]">
                  <table className="w-full text-sm [&_th]:text-start [&_th]:pl-3 [&_th]:text-textLight [&_th]:font-semibold [&_th]:py-[5px]">
                    <thead>
                      <tr className="border-b bg-[#F7F7F8]">
                        <th>Product/Package</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b hover:bg-gray-50 text-textDark font-medium text-sm"
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-1">
                              {item.isPackage && (
                                <Package
                                  className="h-3 w-3 text-purple-600"
                                  title="Package"
                                />
                              )}
                              {/* <button className="p-1">
                                <SwipeIcon />
                              </button> */}
                              {/* <select
                                value={item.productId || ""}
                                onChange={(e) =>
                                  handleProductSelect(index, e.target.value)
                                }
                                disabled={item.isPackage}
                                className="w-full border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-1 text-xs disabled:bg-gray-100"
                              >
                                <option value="">
                                  {item.isPackage
                                    ? "Package Item"
                                    : "Select Product"}
                                </option>
                                {!item.isPackage &&
                                  products.map((product) => (
                                    <option
                                      key={product._id}
                                      value={product._id}
                                    >
                                      {product.name} -{" "}
                                      {formatCurrency(product.price)}
                                    </option>
                                  ))}
                              </select> */}
                              <CustomDropdown
                                products={products}
                                selected={item.productId}
                                disabled={item.isPackage}
                                formatCurrency={formatCurrency}
                                handleNewItemProductSelect={(productId) =>
                                  handleProductSelect(index, productId)
                                }
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                updateItem(index, "description", e.target.value)
                              }
                              className="w-full border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-1"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-1 text-center"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "rate",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-1 text-right"
                            />
                          </td>
                          <td className="py-2 px-2 font-medium text-right">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => deleteItem(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <DeleteIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Add new item row */}
                      <tr className="border-b bg-[#F1EFF2]">
                        <td className="py-2 px-2">
                          {/* <select
                            value={newItem.productId}
                            onChange={(e) =>
                              handleNewItemProductSelect(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} - {formatCurrency(product.price)}
                              </option>
                            ))}
                            <option
                              value="add_new"
                              className="border-t border-gray-300 bg-blue-50 text-blue-700"
                            >
                              + Add New Product
                            </option>
                          </select> */}
                          <CustomDropdown
                            formatCurrency={formatCurrency}
                            products={products}
                            handleNewItemProductSelect={
                              handleNewItemProductSelect
                            }
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="Enter description..."
                            value={newItem.description}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                description: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                quantity: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={newItem.rate}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                rate: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="py-2 px-2 font-medium text-right text-xs">
                          {formatCurrency(newItem.quantity * newItem.rate)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button onClick={addItem} className="p-1">
                            <CheckRoundIcon />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-[#F1EFF2]">
                      <tr>
                        <td colSpan={6}>
                          <button
                            onClick={addItem} // Assuming this function adds a default empty item or triggers a modal/new row form
                            className="py-1 pl-2 flex items-center gap-1 text-[#51009E] font-medium text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add New Item
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Additional Information - More Compact */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-textDark flex gap-2 items-center pb-[16px]">
                  <AdditionalInfoIcon /> Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Notes <span className="text-[#C0BFC1]">(Optional)</span>
                    </label>

                    <textarea
                      value={invoice.notes}
                      onChange={(e) =>
                        setInvoice({ ...invoice, notes: e.target.value })
                      }
                      rows={4}
                      maxLength={200}
                      placeholder="Write any notes here..."
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm resize-y"
                    />

                    {/* Character count */}
                    <div className="absolute bottom-3.5 right-8 text-xs text-gray-400">
                      {invoice.notes.length}/200
                    </div>

                    {/* Resize icon */}
                    <div className="absolute bottom-4 right-4">
                      <ResizeIcon />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Terms & Conditions{" "}
                      <span className="text-[#C0BFC1]">(Optional)</span>
                    </label>

                    <textarea
                      value={invoice.terms}
                      onChange={(e) =>
                        setInvoice({ ...invoice, terms: e.target.value })
                      }
                      rows={4}
                      maxLength={200}
                      placeholder="Write any notes here..."
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm resize-y"
                    />

                    {/* Character count */}
                    <div className="absolute bottom-3.5 right-8 text-xs text-gray-400">
                      {invoice.terms.length}/200
                    </div>

                    {/* Resize icon */}
                    <div className="absolute bottom-4 right-4">
                      <ResizeIcon />
                    </div>
                  </div>
                </div>

                {/* Mexican Fiscal Fields */}
                {fiscalEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Uso CFDI
                    </label>
                    <select
                      value={invoice.mx_usage || "G03"}
                      onChange={(e) =>
                        setInvoice({ ...invoice, mx_usage: e.target.value })
                      }
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm"
                    >
                      <option value="G01">G01 - Adquisición de mercancías</option>
                      <option value="G02">G02 - Devoluciones, descuentos o bonificaciones</option>
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="I01">I01 - Construcciones</option>
                      <option value="I02">I02 - Mobiliario y equipo de oficina por inversiones</option>
                      <option value="I03">I03 - Equipo de transporte</option>
                      <option value="I04">I04 - Equipo de computo y accesorios</option>
                      <option value="I05">I05 - Dados, troqueles, moldes, matrices y herramental</option>
                      <option value="I06">I06 - Comunicaciones telefónicas</option>
                      <option value="I07">I07 - Comunicaciones satelitales</option>
                      <option value="I08">I08 - Otra maquinaria y equipo</option>
                      <option value="D01">D01 - Honorarios médicos, dentales y gastos hospitalarios</option>
                      <option value="D02">D02 - Gastos médicos por incapacidad o discapacidad</option>
                      <option value="D03">D03 - Gastos funerales</option>
                      <option value="D04">D04 - Donativos</option>
                      <option value="D05">D05 - Intereses reales efectivamente pagados por créditos hipotecarios</option>
                      <option value="D06">D06 - Aportaciones voluntarias al SAR</option>
                      <option value="D07">D07 - Primas por seguros de gastos médicos</option>
                      <option value="D08">D08 - Gastos de transportación escolar obligatoria</option>
                      <option value="D09">D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones</option>
                      <option value="D10">D10 - Pagos por servicios educativos (colegiaturas)</option>
                      <option value="S01">S01 - Sin efectos fiscales</option>
                      <option value="CP01">CP01 - Pagos</option>
                      <option value="CN01">CN01 - Nómina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Forma de Pago
                    </label>
                    <select
                      value={invoice.forma_de_pago || "99"}
                      onChange={(e) =>
                        setInvoice({ ...invoice, forma_de_pago: e.target.value })
                      }
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm"
                    >
                      <option value="1">01 - Efectivo</option>
                      <option value="2">02 - Cheque nominativo</option>
                      <option value="3">03 - Transferencia electrónica de fondos</option>
                      <option value="4">04 - Tarjeta de crédito</option>
                      <option value="5">05 - Monedero electrónico</option>
                      <option value="6">06 - Dinero electrónico</option>
                      <option value="8">08 - Vales de despensa</option>
                      <option value="12">12 - Dación en pago</option>
                      <option value="13">13 - Pago por subrogación</option>
                      <option value="14">14 - Pago por consignación</option>
                      <option value="15">15 - Condonación</option>
                      <option value="17">17 - Compensación</option>
                      <option value="23">23 - Novación</option>
                      <option value="24">24 - Confusión</option>
                      <option value="25">25 - Remisión de deuda</option>
                      <option value="26">26 - Prescripción o caducidad</option>
                      <option value="27">27 - A satisfacción del acreedor</option>
                      <option value="28">28 - Tarjeta de débito</option>
                      <option value="29">29 - Tarjeta de servicios</option>
                      <option value="30">30 - Aplicación de anticipos</option>
                      <option value="31">31 - Intermediario pagos</option>
                      <option value="99">99 - Por definir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={invoice.metodo_de_pago || "PUE"}
                      onChange={(e) =>
                        setInvoice({ ...invoice, metodo_de_pago: e.target.value })
                      }
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm"
                    >
                      <option value="PUE">PUE - Pago en una sola exhibición</option>
                      <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                    </select>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Right Column - Invoice Summary */}
            <div>
              <div className="bg-white rounded-lg shadow p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-textDark flex gap-2 items-center">
                    <ContactInfoIcon /> Contact Information
                  </h3>
                  <button>
                    <LinkIcon />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Customer
                    </label>
                    <div className="relative w-full">
                      <select
                        value={invoice.customerId}
                        onChange={(e) => {
                          const selectedCustomer = customers.find(
                            (c) => c._id === e.target.value
                          );
                          setInvoice({
                            ...invoice,
                            customerId: e.target.value,
                            customerName: selectedCustomer?.name || "",
                            customerEmail: selectedCustomer?.email || "",
                            billingAddress: selectedCustomer?.address || "",
                          });
                        }}
                        className="appearance-none w-full border border-[#EBEBEB] rounded px-2 py-1.5 pl-8 text-sm focus:outline-none focus:ring-0 focus:ring-[#EBEBEB] pr-10 text-red shadow-sm"
                        style={{ color: "#171717" }}
                      >
                        <option value="" className="text-gray-400">
                          Select Customer
                        </option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>

                      {/* left user icon */}

                      <div className="pointer-events-none absolute left-3 top-[7px] text-gray-500">
                        <UserIcon />
                      </div>

                      {/* Custom arrow */}
                      <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Associated Email
                    </label>
                    <input
                      type="email"
                      value={invoice.customerEmail}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          customerEmail: e.target.value,
                        })
                      }
                      className="w-full border border-[#EBEBEB] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-0 focus:ring-[#EBEBEB] pr-10 text-red shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm mb-3">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-textDark flex gap-2 items-center pb-[16px]">
                    <InvoiceSummaryIcon /> Invoice Summary
                  </h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#8E8C8F]">Subtotal:</span>
                    <span className="font-medium text-base">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center  gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8E8C8F]  text-base">Tax </span>
                      <div className="relative w-[80%]">
                        <select
                          value={invoice.taxRate}
                          onChange={(e) => handleTaxChange(e.target.value)}
                          className="appearance-none w-full border border-[#EBEBEB] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-0 focus:ring-[#EBEBEB] pr-10 shadow-sm"
                        >
                          {taxOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {/* Custom arrow */}
                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <span className="font-medium min-w-16 text-right text-base">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center px-4 py-3 border-t">
                  <span className="text-base font-semibold text-[#18181B]">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-[#240046]">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 border-t">
                  <span className="text-base font-semibold text-[#18181B]">
                    Amount Paid:
                  </span>
                  <span className="text-lg font-bold text-[#27BE69]">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-4 border-t bg-[#F7F7F8]">
                  <div>
                    <span className="text-base font-semibold text-[#18181B] block mb-1">
                      Total Due:
                    </span>

                    <span className="text-xs text-[#8E8C8F] flex gap-2 items-center block">
                      {" "}
                      <ClockIcon /> Due Date 1
                      {invoice?.dueDate &&
                        dayjs(invoice?.dueDate).format("D MMM YYYY")}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#FC3400]">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                {/* Payments Section */}

                <h4 className="text-lg font-medium text-textDark flex gap-2 items-center pb-[16px]">
                  <PaymentHistoryIcon /> Payments History
                </h4>

                {/* Record Payment Button */}
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isNewInvoice}
                  className="w-full flex items-center justify-center gap-1 bg-primary text-white px-3 py-2 rounded text-xs  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" />
                  Record Payment
                </button>

                {/* Payment History */}
                <div className="space-y-1.5 mb-3 max-h-64 overflow-y-auto mt-[16px]">
                  {fetchingPayments ? (
                    <div className="text-xs text-gray-500 text-center py-2">
                      Loading payments...
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-2">
                      No payments recorded
                    </div>
                  ) : (
                    payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="bg-white border rounded-lg overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="p-[12px]">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-[#18181B]">
                                  {payment.type}
                                </span>
                                <div>
                                  <span className="text-sm font-semibold text-green-600">
                                    +{formatCurrency(payment.amount)}
                                  </span>
                                  <button
                                    onClick={() => deletePayment(payment._id)}
                                    className="ml-1 text-[#8E8C8F] text-lg"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <div className="text-xs text-[#8E8C8F] flex items-center">
                                <span>
                                  {payment.date &&
                                    dayjs(payment.date).format("D MMM YYYY")}
                                </span>{" "}
                                <Dot color="#8E8C8F" />{" "}
                                <span>{payment.method}</span>
                              </div>
                            </div>
                            {payment.reference && (
                              <div className="text-xs bg-[#F8F8F8] border-t px-[12px] py-[8px]">
                                <span className="text-[#8E8C8F]">
                                  {" "}
                                  Ref: {payment.reference}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Status Section */}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 mt-3">
                <h3 className="text-lg font-medium text-textDark flex gap-2 items-center pb-[16px]">
                  Status
                </h3>

                <div className="space-y-1.5 text-sm font-medium text-[#18181B]">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs capitalize">
                      {invoice.status}
                    </span>
                  </div>
                  {invoice.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-[#8E8C8F]">
                        {invoice.createdAt &&
                          dayjs(invoice.createdAt).format("D MMM YYYY")}
                      </span>
                    </div>
                  )}
                  {invoice.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modified:</span>
                      <span className="text-[#8E8C8F]">
                        {invoice.updatedAt &&
                          dayjs(invoice.updatedAt).format("D MMM YYYY")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due:</span>

                    <span className="text-[#8E8C8F]">
                      {invoice.dueDate &&
                        dayjs(invoice.dueDate).format("D MMM YYYY")}
                    </span>
                  </div>
                  {invoice.sentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent:</span>

                      <span className="text-[#8E8C8F]">
                        {invoice.sentDate &&
                          dayjs(invoice.sentDate).format("D MMM YYYY")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package Selection Modal */}
        {showPackageModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPackageModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Select Package
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreatePackageModal(true)}
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Create New Package
                  </button>
                  <button
                    onClick={() => setShowPackageModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {packages.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No packages available
                    </p>
                    <button
                      onClick={() => setShowCreatePackageModal(true)}
                      className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Create your first package
                    </button>
                  </div>
                ) : (
                  packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {pkg.name}
                          </h4>
                          {pkg.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            {formatCurrency(pkg.totalPrice || 0)}
                          </div>
                          {pkg.category && (
                            <div className="text-xs text-gray-500">
                              {pkg.category}
                            </div>
                          )}
                        </div>
                      </div>

                      {pkg.products && pkg.products.length > 0 && (
                        <div className="text-xs text-gray-600 mb-2">
                          <strong>Includes:</strong>{" "}
                          {pkg.products
                            .map(
                              (p) =>
                                `${p.quantity}x ${
                                  p.product ? p.product.name : "Unknown"
                                }`
                            )
                            .join(", ")}
                        </div>
                      )}

                      <button
                        onClick={() => handlePackageSelect(pkg)}
                        className="w-full bg-purple-600 text-white px-3 py-1.5 text-sm rounded hover:bg-purple-700"
                      >
                        Add Package
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Package Creation Modal */}
        {showCreatePackageModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreatePackageModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Create New Package
                </h3>
                <button
                  onClick={() => setShowCreatePackageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Package Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter package name"
                      value={newPackage.name}
                      onChange={(e) =>
                        setNewPackage({ ...newPackage, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="Package category"
                      value={newPackage.category}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          category: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Package description"
                    value={newPackage.description}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Select Products for Package *
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                    {products.map((product) => {
                      const isSelected = selectedPackageProducts.some(
                        (p) => p.productId === product._id
                      );
                      const selectedProduct = selectedPackageProducts.find(
                        (p) => p.productId === product._id
                      );

                      return (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleProductInPackage(product._id)
                              }
                              className="mr-2"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(product.price)}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">
                                Qty:
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={selectedProduct?.quantity || 1}
                                onChange={(e) =>
                                  updatePackageProductQuantity(
                                    product._id,
                                    e.target.value
                                  )
                                }
                                className="w-16 border border-gray-300 rounded px-1 py-0.5 text-xs text-center"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Products Summary */}
                {selectedPackageProducts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">
                      Selected Products
                    </h4>
                    <div className="space-y-1 text-xs">
                      {selectedPackageProducts.map((p) => (
                        <div key={p.productId} className="flex justify-between">
                          <span>
                            {p.quantity}x {p.product.name}
                          </span>
                          <span>
                            {formatCurrency(p.quantity * p.product.price)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                        <span>Calculated Total:</span>
                        <span>{formatCurrency(calculatePackageTotal())}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Package Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Package Price (leave empty to use calculated total)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={calculatePackageTotal().toFixed(2)}
                    value={newPackage.totalPrice || ""}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        totalPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowCreatePackageModal(false)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createPackage}
                  disabled={
                    !newPackage.name || selectedPackageProducts.length === 0
                  }
                  className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Package
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Creation Modal */}
        {showProductModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowProductModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Create New Product
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Product description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      placeholder="Product SKU"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Product category"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createProduct}
                  disabled={!newProduct.name || !newProduct.price}
                  className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPaymentModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Record Payment
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={newPayment.type}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Payment">Payment</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Refund">Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newPayment.method}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, method: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining: {formatCurrency(remainingBalance)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Transaction ID, Check #, etc."
                    value={newPayment.reference || ""}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        reference: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={newPayment.date}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Additional notes..."
                    value={newPayment.notes || ""}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addPayment}
                  disabled={
                    !newPayment.amount || parseFloat(newPayment.amount) <= 0
                  }
                  className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageHeader>
  );
}
