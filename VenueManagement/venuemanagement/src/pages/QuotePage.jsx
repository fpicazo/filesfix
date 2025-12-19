import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  Send,
  Save,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Info,
  FileText,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import http from "../config/http";
import HomeIcon from "../assets/helperIcons/HomeIcon";
import EditIcon from "../assets/helperIcons/EditIcon";
import RightIcon from "../assets/helperIcons/RightIcon";
import CustomDatePicker from "../components/CustomDatePicker";
import CalenderIcon from "../assets/helperIcons/CalendarIcon";
import ArrowDownIcon from "../assets/helperIcons/ArrowDownIcon";
import dayjs from "dayjs";
import SendIcon from "../assets/helperIcons/SendIcon";
import SaveIcon from "../assets/helperIcons/SaveIcon";
import CalenderBigIcon from "../assets/helperIcons/CalenderBigIcon";
import DateTimeIcon from "../assets/helperIcons/DateTimeIcon";
import ClockIcon from "../assets/helperIcons/ClockIcon";
import UserIcon from "../assets/helperIcons/UserIcon";
import CalenderCheckIcon from "../assets/helperIcons/CalenderCheckIcon";
import ServiceIcon from "../assets/helperIcons/ServiceIcon";
import DeleteIcon from "../assets/helperIcons/DeleteIcon";
import CheckRoundIcon from "../assets/helperIcons/CheckRoundIcon";
import CustomDropdown from "../components/CustomDropdown";
import AdditionalInfoIcon from "../assets/helperIcons/AdditionalInfoIcon";
import ResizeIcon from "../assets/helperIcons/ResizeIcon";
import ContactInfoIcon from "../assets/helperIcons/ContactInfoIcon";
import LinkIcon from "../assets/helperIcons/LinkIcon";
import InvoiceSummaryIcon from "../assets/helperIcons/InvoiceSummaryIcon";

export default function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewQuote = !id || id === "new";

  // Loading states
  const [loading, setLoading] = useState(!isNewQuote);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [customers, setCustomers] = useState([]);

  // State for quote data with embedded event information
  const [quote, setQuote] = useState({
    quoteNumber: "",
    quoteDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    customerId: "",
    customerName: "",
    customerEmail: "",
    billingAddress: "",
    status: "draft",
    taxRate: 16,
    taxName: "IVA",
    notes: "",
    terms: "",
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    couponId: "",
    couponDiscount: 0,
    eventId: "",
    eventName: "",
    // Event information embedded in quote
    eventData: {
      eventDate: "",
      eventTime: "",
      eventType: "",
      guests: "",
      location: "",
      venue: "",
      typeOfFood: "",
      sillasType: "",
      mantelType: "",
    },
  });

  const taxOptions = [
    { value: 0, label: "No Tax (0%)", name: "No Tax" },
    { value: 16, label: "VAT (16%)", name: "VAT" },
    { value: 8.5, label: "Sales Tax (8.5%)", name: "Sales Tax" },
    { value: 21, label: "Standard Rate (21%)", name: "Standard Rate" },
  ];

  // State for quote items
  const [items, setItems] = useState([]);

  // State for editing items
  const [newItem, setNewItem] = useState({
    productId: "",
    description: "",
    quantity: 1,
    rate: 0,
  });

  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  
  // State for coupons
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

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

  // State for create event modal
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventTime, setEventTime] = useState("");

  // visibility states
  const [showQuoteDatePicker, setShowQuoteDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [showQuoteNumberEdit, setShowQuoteNumberEdit] = useState(false);

  const handleCalendar = (value) => {
    switch (value) {
      case "quote":
        return setShowQuoteDatePicker(!showQuoteDatePicker);
      case "expiry":
        return setShowExpiryDatePicker(!showExpiryDatePicker);
      case "event":
        return setShowEventDatePicker(!showEventDatePicker);
      default:
        return setShowQuoteDatePicker(!showQuoteDatePicker);
    }
  };

  const handleDateChange = (value, date) => {
    switch (value) {
      case "quote":
        // Calculate expiry date as 1 month after the quote date using dayjs
        const expiryDate = dayjs(date).add(1, 'month').format('YYYY-MM-DD');
        
        return setQuote({
          ...quote,
          quoteDate: date,
          expiryDate: expiryDate,
        });
      case "expiry":
        return setQuote({
          ...quote,
          expiryDate: date,
        });
      case "event":
        return setQuote({
          ...quote,
          eventData: { ...quote.eventData, eventDate: date },
        });
      default:
        return setShowQuoteDatePicker(!showQuoteDatePicker);
    }
  };

  const handleTaxChange = (value) => {
    const selectedTax = taxOptions.find(
      (tax) => tax.value === parseFloat(value)
    );
    setQuote({
      ...quote,
      taxRate: parseFloat(value),
      taxName: selectedTax ? selectedTax.name : "Custom Tax",
    });
  };

  const handleEventDataChange = (field, value) => {
    setQuote({
      ...quote,
      eventData: {
        ...quote.eventData,
        [field]: value,
      },
    });
  };

  // Calculate totals first (before useEffects)
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const taxAmount = (subtotalAfterCoupon * quote.taxRate) / 100;
  const total = subtotalAfterCoupon + taxAmount;

  // Fetch quote data on component mount
  useEffect(() => {
    if (isNewQuote) {
      generateQuoteNumber();
      fetchCustomers();
      fetchProducts();
      fetchPackages();
      fetchCoupons();
    } else {
      fetchQuoteData();
    }
  }, [id]);

  // Restore selected coupon when coupons are loaded
  useEffect(() => {
    if (quote.couponId && coupons.length > 0) {
      const savedCoupon = coupons.find(c => c._id === quote.couponId);
      if (savedCoupon && !selectedCoupon) {
        setSelectedCoupon(savedCoupon);
      }
    }
  }, [coupons, quote.couponId]);

  // Recalculate coupon discount when subtotal or selected coupon changes
  useEffect(() => {
    if (selectedCoupon && subtotal > 0) {
      const discount = (subtotal * selectedCoupon.discount) / 100;
      setCouponDiscount(discount);
      setQuote(prev => ({
        ...prev,
        couponDiscount: discount
      }));
    }
  }, [selectedCoupon, subtotal]);

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await http.get("/api/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await http.get("/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await http.get("/api/packages");
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await http.get("/api/discounts");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  // Generate new quote number
  const generateQuoteNumber = async () => {
    try {
      const response = await http.post("/api/quotes/generate-number");
      setQuote((prev) => ({
        ...prev,
        quoteNumber: response.data.quoteNumber,
      }));
    } catch (error) {
      console.error("Error generating quote number:", error);
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-3);
      setQuote((prev) => ({
        ...prev,
        quoteNumber: `QUO-${year}-${timestamp}`,
      }));
    }
  };

  // Fetch quote data for editing
  const fetchQuoteData = async () => {
    try {
      setLoading(true);

      // Fetch quote data and other required data in parallel
      const [quoteResponse] = await Promise.all([
        http.get(`/api/quotes/${id}?populate=customerId`),
        fetchCustomers(),
        fetchProducts(),
        fetchPackages(),
        fetchCoupons()
      ]);
      console.log("Quote data fetched:", quoteResponse.data);
      const quoteData = quoteResponse.data;

      setQuote(prev => ({
        ...prev,
        quoteNumber: quoteData.quoteNumber || "",
        quoteDate: quoteData.date?.split("T")[0] || "",
        customerId: quoteData.customerId?._id || quoteData.customerId || "",
        customerName: quoteData.customerId?.name || "",
        status: quoteData.status || "draft",
        total: quoteData.total || 0,
        subtotal: quoteData.cost || 0,
        notes: quoteData.description || "",
        terms: "",
        eventId: quoteData.eventId?._id || "",
        eventName: quoteData.eventId?.name || "",
        eventData: {
          ...prev.eventData,
          eventDate: quoteData.date?.split("T")[0] || "",
          eventTime: quoteData.time || "",
          eventType: quoteData.eventType || "",
          guests: quoteData.guests?.toString() || "",
          location: quoteData.location || "",
          typeOfFood: quoteData.typeOfFood || "",
          sillasType: quoteData.sillasType || "",
          mantelType: quoteData.mantelType || "",
        },
      }));

      setItems(quoteData.products || []);

      // Restore coupon if it exists
      if (quoteData.couponId && quoteData.couponDiscount) {
        setCouponDiscount(quoteData.couponDiscount);
      }
    } catch (error) {
      console.error("Error fetching quote data:", error);
      alert("Error loading quote data");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Handle coupon selection
  const handleCouponSelect = (couponId) => {
    if (!couponId) {
      setSelectedCoupon(null);
      setCouponDiscount(0);
      setQuote(prev => ({
        ...prev,
        couponId: "",
        couponDiscount: 0
      }));
      return;
    }

    const coupon = coupons.find((c) => c._id === couponId);
    if (coupon) {
      setSelectedCoupon(coupon);
      // Calculate discount based on subtotal and coupon percentage
      const discount = (subtotal * coupon.discount) / 100;
      setCouponDiscount(discount);
      setQuote(prev => ({
        ...prev,
        couponId: coupon._id,
        couponDiscount: discount
      }));
    }
  };

  // Handle product selection for existing items
  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      updateItem(index, "productId", productId);
      updateItem(index, "description", selectedProduct.name);
      updateItem(index, "rate", selectedProduct.price);
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
      });
    } else {
      setNewItem({
        ...newItem,
        productId: "",
        description: "",
        rate: 0,
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

    const itemNames = packageData.products
      .map((p) => (p.product ? p.product.name : "Unknown Item"))
      .join(", ");
    const packageDescription = `${packageData.name} - Includes: ${itemNames}`;

    const packagePrice =
      packageData.totalPrice ||
      packageData.products.reduce((sum, p) => {
        return sum + (p.product ? p.product.price * p.quantity : 0);
      }, 0);

    const packageItem = {
      productId: null,
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

      setPackages([...packages, response.data]);

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

      setProducts([...products, response.data]);

      setNewItem({
        ...newItem,
        productId: response.data._id,
        description: response.data.name,
        rate: response.data.price,
      });

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

  // Save quote function
  const saveQuote = async () => {
    // Validation for required event fields
    if (!quote.eventData.eventDate) {
      alert("Please enter the event date");
      return;
    }
    if (!quote.eventData.eventType) {
      alert("Please enter the event type");
      return;
    }
    if (!quote.eventData.location) {
      alert("Please enter the event location");
      return;
    }

    try {
      setSaving(true);

      const quoteData = {
        quoteNumber: quote.quoteNumber,
        description: quote.notes || "", // Using notes as description
        date: quote.eventData.eventDate || new Date(),
        time: quote.eventData.eventTime || "",
        total: total,
        eventId: quote.eventId || undefined,
        eventName: quote.eventName || undefined,
        products: items.map((item) => ({
          productId: item.productId || null,
          packageId: item.packageId || null,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          isPackage: item.isPackage || false,
        })),
        status: quote.status,
        typeOfFood: quote.eventData.typeOfFood || "",
        cost: subtotal,
        guests: parseInt(quote.eventData.guests) || 0,
        eventType: quote.eventData.eventType,
        location: quote.eventData.location,
        sillasType: quote.eventData.sillasType || "",
        mantelType: quote.eventData.mantelType || "",
        customerId: quote.customerId,
      };

      let response;
      if (isNewQuote) {
        response = await http.post("/api/quotes", quoteData);
        navigate(`/quotes/${response.data._id}`);
      } else {
        response = await http.put(`/api/quotes/${id}`, quoteData);
        // Map the backend response back to frontend structure
        const savedQuoteData = response.data;
        setQuote(prev => ({
          ...prev,
          quoteNumber: savedQuoteData.quoteNumber || prev.quoteNumber,
          quoteDate: savedQuoteData.date?.split("T")[0] || prev.quoteDate,
          customerId: savedQuoteData.customerId?._id || savedQuoteData.customerId || prev.customerId,
          customerName: savedQuoteData.customerId?.name || prev.customerName,
          status: savedQuoteData.status || prev.status,
          total: savedQuoteData.total || prev.total,
          subtotal: savedQuoteData.cost || prev.subtotal,
          notes: savedQuoteData.description || prev.notes,
          eventData: {
            ...prev.eventData,
            eventDate: savedQuoteData.date?.split("T")[0] || prev.eventData.eventDate,
            eventTime: savedQuoteData.time || prev.eventData.eventTime,
            eventType: savedQuoteData.eventType || prev.eventData.eventType,
            guests: savedQuoteData.guests?.toString() || prev.eventData.guests,
            location: savedQuoteData.location || prev.eventData.location,
            typeOfFood: savedQuoteData.typeOfFood || prev.eventData.typeOfFood,
            sillasType: savedQuoteData.sillasType || prev.eventData.sillasType,
            mantelType: savedQuoteData.mantelType || prev.eventData.mantelType,
          },
        }));
      }

      alert("Quote saved successfully!");
    } catch (error) {
      console.error("Error saving quote:", error);
      alert(
        "Error saving quote: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Send quote
  const sendQuote = async () => {
    try {
      if (isNewQuote) {
        alert("Please save the quote first");
        return;
      }

      await http.post(`/api/quotes/${id}/send`);
      setQuote((prev) => ({ ...prev, status: "sent" }));
      alert("Quote sent successfully!");
    } catch (error) {
      console.error("Error sending quote:", error);
      alert("Error sending quote");
    }
  };

  // Convert quote to invoice
  const convertToInvoice = async () => {
    try {
      if (isNewQuote) {
        alert("Please save the quote first");
        return;
      }

      setConverting(true);
      const response = await http.post(`/api/quotes/${id}/convert-to-invoice`);
      alert("Quote converted to invoice successfully!");
      navigate(`/invoices/${response.data._id}`);
    } catch (error) {
      console.error("Error converting quote:", error);
      alert(
        "Error converting quote: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setConverting(false);
    }
  };

  // Generate proposal function
  const generateProposal = async () => {
    if (isNewQuote) {
      alert("Please save the quote first");
      return;
    }

    setGenerating(true);
    try {
      const response = await http.post(`/api/quotes/generate-proposal/${id}`);
      console.log("Proposal generated:", response.data);
      if (response.data && response.data.url) {
        window.open(response.data.url, "_blank");
      }
    } catch (error) {
      console.error("Error generating proposal:", error);
      alert(
        "Error generating proposal: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setGenerating(false);
    }
  };

  // Create event from quote
  const createEventFromQuote = async () => {
    // Validation
    if (!eventName || eventName.trim() === "") {
      alert("Please enter the event name");
      return;
    }
    if (!quote.eventData.eventDate) {
      alert("Please enter the event date");
      return;
    }
    if (!quote.eventData.eventType) {
      alert("Please enter the event type");
      return;
    }
    if (!quote.eventData.location) {
      alert("Please enter the event location");
      return;
    }
    if (!quote.customerId) {
      alert("Please select a customer");
      return;
    }

    try {
      setCreatingEvent(true);

      const eventData = {
        name: eventName || `${quote.eventData.eventType} Event`,
        date: quote.eventData.eventDate,
        time: eventTime || quote.eventData.eventTime || "",
        eventType: quote.eventData.eventType,
        guests: parseInt(quote.eventData.guests) || 0,
        location: quote.eventData.location,
        venue: quote.eventData.venue || "",
        typeOfFood: quote.eventData.typeOfFood || "",
        sillasType: quote.eventData.sillasType || "",
        mantelType: quote.eventData.mantelType || "",
        customerId: quote.customerId,
        description: quote.notes || "",
        status: "pending",
        products: items.map((item) => ({
          productId: item.productId || null,
          packageId: item.packageId || null,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          isPackage: item.isPackage || false,
        })),
        cost: subtotal,
        total: total,
        quoteId: id, // Link back to the quote
      };

      const response = await http.post("/api/events", eventData);
      
      // Update quote with eventId and eventName
      const updatedQuote = {
        ...quote,
        eventId: response.data._id,
        eventName: eventName,
      };
      
      // Save the updated quote with eventId
      try {
        await http.put(`/api/quotes/${id}`, {
          eventId: response.data._id,
          eventName: eventName,
        });
        setQuote(updatedQuote);
      } catch (updateError) {
        console.error("Error updating quote with eventId:", updateError);
      }
      
      setShowCreateEventModal(false);
      alert("Event created successfully!");
      
      // Navigate to the newly created event
      navigate(`/events/${response.data._id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert(
        "Error creating event: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setCreatingEvent(false);
    }
  };

  // Handle navigation actions
  const handleBack = () => navigate("/quotes");
  const handlePreview = () => {
    window.open(`/quotes/${id}/preview`, "_blank");
  };
  const handleSend = sendQuote;
  const handleSave = saveQuote;

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Loading quote...</div>
      </div>
    );
  }

  const actions = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          disabled={isNewQuote}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>
        <button
          onClick={handleSend}
          disabled={isNewQuote || saving}
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
          onClick={generateProposal}
          disabled={isNewQuote || generating}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-3 w-3" />
          {generating ? "Generating..." : "Generate Proposal"}
        </button>
      </div>
    </div>
  );

  return (
    <PageHeader title="Edit Quote" backPath="/quotes" actions={actions}>
      <div className="min-h-screen">
        {/* Main Content */}
        <div className="px-4 py-4">
          {/* Quote Details */}
          <div className="flex gap-[8px] items-center">
            <Link to="/">
              <HomeIcon />
            </Link>
            <div>
              <RightIcon color="#D4D4D5" />
            </div>
            <Link
              to="/quotes"
              className="block text-sm font-medium text-textLight"
            >
              Quotes
            </Link>
            <div>
              <RightIcon color="#D4D4D5" />
            </div>
            <p className="text-textDark font-medium text-sm">
              {quote?.quoteNumber}
            </p>
          </div>

          <div className="flex gap-[12px] items-center mt-3">
            {showQuoteNumberEdit ? (
              <input
                type="text"
                value={quote.quoteNumber}
                onChange={(e) =>
                  setQuote({
                    ...quote,
                    quoteNumber: e.target.value,
                  })
                }
                className="w-[220px] text-[32px] border border-gray-300 rounded p-0 focus:outline-none focus:ring-1 focus:ring-purple-500 border-0 font-medium"
              />
            ) : (
              <h2 className="text-[32px] text-textDark font-medium">
                {quote?.quoteNumber}
              </h2>
            )}

            <button
              className="border rounded-md p-[7px]"
              onClick={() => setShowQuoteNumberEdit(!showQuoteNumberEdit)}
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
                  onClick={() => handleCalendar("quote")}
                >
                  <CalenderIcon color="#8E8C8F" />
                  <p className="text-textLight text-sm">Issued on</p>
                  <p className="text-textDark font-medium text-sm">
                    {dayjs(quote?.quoteDate).format("DD MMM YYYY")}
                  </p>
                  {showQuoteDatePicker ? (
                    <span className="-rotate-180">
                      <ArrowDownIcon color="#240046" />
                    </span>
                  ) : (
                    <ArrowDownIcon color="#AEADAF" />
                  )}
                </div>

                {showQuoteDatePicker && (
                  <div className="absolute z-50 top-full mt-2 right-0 w-full">
                    <CustomDatePicker
                      selectedDate={quote?.quoteDate}
                      onChange={(date) => handleDateChange("quote", date)}
                      onClose={() => setShowQuoteDatePicker(false)}
                    />
                  </div>
                )}
              </div>
              {/* expiry date */}
              <div className="relative">
                <div
                  className="flex flex-row items-center gap-2 cursor-pointer"
                  onClick={() => handleCalendar("expiry")}
                >
                  <DateTimeIcon color="#8E8C8F" />
                  <p className="text-textLight text-sm">Valid Until</p>
                  <p className="text-textDark font-medium text-sm">
                    {dayjs(quote?.expiryDate).format("DD MMM YYYY")}
                  </p>
                  {showExpiryDatePicker ? (
                    <span className="-rotate-180">
                      <ArrowDownIcon color="#240046" />
                    </span>
                  ) : (
                    <ArrowDownIcon color="#AEADAF" />
                  )}
                </div>

                {showExpiryDatePicker && (
                  <div className="absolute z-50 top-full mt-2 right-0 w-full">
                    <CustomDatePicker
                      selectedDate={quote?.expiryDate}
                      onChange={(date) => handleDateChange("expiry", date)}
                      onClose={() => setShowExpiryDatePicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handlePreview}
                disabled={isNewQuote}
                className="flex bg-[#fff] items-center gap-1 py-[8px] px-[12px] text-sm text-black border border-[#EBEBEB] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Eye className="h-4 w-4 text-[#8E8C8F]" />
              </button>
              <button
                onClick={handleSend}
                disabled={isNewQuote || saving}
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
              <button
                onClick={generateProposal}
                disabled={isNewQuote || generating}
                className="flex items-center gap-1 py-[8px] px-[16px] text-sm border border-[#EBEBEB] rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-green-600 text-white"
              >
                <FileText className="h-4 w-4" />
                {generating ? "Generating..." : "Generate Proposal"}
              </button>
              <button
                onClick={() => {
                  setEventName(`${quote.eventData.eventType || "Event"} - ${customers.find((c) => c._id === quote.customerId)?.name || "Customer"}`);
                  setEventTime(quote.eventData.eventTime || "");
                  setShowCreateEventModal(true);
                }}
                disabled={isNewQuote}
                className="flex items-center gap-1 py-[8px] px-[16px] text-sm border border-[#EBEBEB] rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-blue-600 text-white"
              >
                <FileText className="h-4 w-4" />
                Create Event
              </button>
              <button
                onClick={convertToInvoice}
                disabled={isNewQuote || converting}
                className="flex items-center gap-1 py-[8px] px-[16px] text-sm border border-[#EBEBEB] rounded  disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-primary text-white"
              >
                <FileText className="h-4 w-4" />
                {converting ? "Converting..." : "Convert to Invoice"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_400px] gap-4 pt-4">
            {/* Left Column - Form Content */}
            <div className="flex flex-col gap-4">
              {/* Event Information - Now with input fields */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-textDark flex gap-2 items-center mb-4">
                  <CalenderBigIcon /> Event Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Event Date */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="flex flex-row items-center gap-2 cursor-pointer border border-[#EBEBEB] rounded px-3 py-2"
                      onClick={() => handleCalendar("event")}
                    >
                      <CalenderCheckIcon />
                      <input
                        type="text"
                        value={
                          quote.eventData.eventDate
                            ? dayjs(quote.eventData.eventDate).format(
                                "DD MMM YYYY"
                              )
                            : "Select date"
                        }
                        readOnly
                        className="flex-1 text-sm focus:outline-none cursor-pointer"
                      />
                      <ArrowDownIcon color="#AEADAF" />
                    </div>

                    {showEventDatePicker && (
                      <div className="absolute z-50 top-full mt-2 left-0 w-full">
                        <CustomDatePicker
                          selectedDate={quote.eventData.eventDate}
                          onChange={(date) => handleDateChange("event", date)}
                          onClose={() => setShowEventDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Event Time */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      value={quote.eventData.eventTime}
                      onChange={(e) =>
                        handleEventDataChange("eventTime", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Wedding, Birthday, Corporate..."
                      value={quote.eventData.eventType}
                      onChange={(e) =>
                        handleEventDataChange("eventType", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={quote.eventData.guests}
                      onChange={(e) =>
                        handleEventDataChange("guests", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="City or address"
                      value={quote.eventData.location}
                      onChange={(e) =>
                        handleEventDataChange("location", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      placeholder="Venue or hall name"
                      value={quote.eventData.venue}
                      onChange={(e) =>
                        handleEventDataChange("venue", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Type of Food */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Type of Food
                    </label>
                    <input
                      type="text"
                      placeholder="Italian, Mexican, Buffet..."
                      value={quote.eventData.typeOfFood || ""}
                      onChange={(e) =>
                        handleEventDataChange("typeOfFood", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Chairs Type */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Chairs Type
                    </label>
                    <input
                      type="text"
                      placeholder="Chiavari, Folding, Garden..."
                      value={quote.eventData.sillasType || ""}
                      onChange={(e) =>
                        handleEventDataChange("sillasType", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Table Cloth Type */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Table Cloth Type
                    </label>
                    <input
                      type="text"
                      placeholder="Linen, Polyester, Cotton..."
                      value={quote.eventData.mantelType || ""}
                      onChange={(e) =>
                        handleEventDataChange("mantelType", e.target.value)
                      }
                      className="w-full border border-[#EBEBEB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Services & Items */}
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
                            onClick={addItem}
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

              {/* Additional Information */}
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
                      value={quote.notes || ""}
                      onChange={(e) =>
                        setQuote({ ...quote, notes: e.target.value })
                      }
                      rows={4}
                      maxLength={200}
                      placeholder="Write any notes here..."
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm resize-y"
                    />

                    <div className="absolute bottom-3.5 right-8 text-xs text-gray-400">
                      {(quote.notes || "").length}/200
                    </div>

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
                      value={quote.terms || ""}
                      onChange={(e) =>
                        setQuote({ ...quote, terms: e.target.value })
                      }
                      rows={4}
                      maxLength={200}
                      placeholder="Write any notes here..."
                      className="w-full border border-[#EBEBEB] rounded-lg px-[16px] py-[12px] text-sm focus:outline-none shadow-sm resize-y"
                    />

                    <div className="absolute bottom-3.5 right-8 text-xs text-gray-400">
                      {(quote.terms || "").length}/200
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <ResizeIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quote Summary */}
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
                        value={quote.customerId}
                        onChange={(e) => {
                          const selectedCustomer = customers.find(
                            (c) => c._id === e.target.value
                          );
                          setQuote({
                            ...quote,
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

                      <div className="pointer-events-none absolute left-3 top-[7px] text-gray-500">
                        <UserIcon />
                      </div>

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
                      value={quote.customerEmail}
                      onChange={(e) =>
                        setQuote({
                          ...quote,
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
                    <InvoiceSummaryIcon /> Quote Summary
                  </h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#8E8C8F]">Subtotal:</span>
                    <span className="font-medium text-base">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  
                  {/* Coupon Section */}
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8E8C8F] text-base">Coupon</span>
                      <div className="relative w-[80%]">
                        <select
                          value={selectedCoupon?._id || ""}
                          onChange={(e) => handleCouponSelect(e.target.value)}
                          className="appearance-none w-full border border-[#EBEBEB] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-0 focus:ring-[#EBEBEB] pr-10 shadow-sm"
                        >
                          <option value="">Select a coupon</option>
                          {coupons.map((coupon) => (
                            <option key={coupon._id} value={coupon._id}>
                              {coupon.name} ({coupon.discount}% off)
                            </option>
                          ))}
                        </select>
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
                    <span className="font-medium min-w-16 text-right text-base text-green-600">
                      {couponDiscount > 0 ? `-${formatCurrency(couponDiscount)}` : formatCurrency(0)}
                    </span>
                  </div>
                  
                  {selectedCoupon && (
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8E8C8F]">Subtotal (after discount):</span>
                      <span className="font-medium text-base">
                        {formatCurrency(subtotalAfterCoupon)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center  gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8E8C8F]  text-base">Tax </span>
                      <div className="relative w-[80%]">
                        <select
                          value={quote.taxRate}
                          onChange={(e) => handleTaxChange(e.target.value)}
                          className="appearance-none w-full border border-[#EBEBEB] rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-0 focus:ring-[#EBEBEB] pr-10 shadow-sm"
                        >
                          {taxOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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

                <div className="flex justify-between items-center px-4 py-3 border-t bg-[#F7F7F8]">
                  <div>
                    <span className="text-base font-semibold text-[#18181B] block mb-1">
                      Total Amount:
                    </span>

                    <span className="text-xs text-[#8E8C8F] flex gap-2 items-center block">
                      {" "}
                      <ClockIcon /> Valid Until{" "}
                      {quote?.expiryDate &&
                        dayjs(quote?.expiryDate).format("D MMM YYYY")}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#240046]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-medium text-textDark flex gap-2 items-center pb-[16px]">
                  Status
                </h3>

                <div className="space-y-1.5 text-sm font-medium text-[#18181B]">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs capitalize">
                      {quote.status}
                    </span>
                  </div>
                  {quote.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-[#8E8C8F]">
                        {quote.createdAt &&
                          dayjs(quote.createdAt).format("D MMM YYYY")}
                      </span>
                    </div>
                  )}
                  {quote.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modified:</span>
                      <span className="text-[#8E8C8F]">
                        {quote.updatedAt &&
                          dayjs(quote.updatedAt).format("D MMM YYYY")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>

                    <span className="text-[#8E8C8F]">
                      {quote.expiryDate &&
                        dayjs(quote.expiryDate).format("D MMM YYYY")}
                    </span>
                  </div>
                  {quote.sentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent:</span>

                      <span className="text-[#8E8C8F]">
                        {quote.sentDate &&
                          dayjs(quote.sentDate).format("D MMM YYYY")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Card */}
              {quote.eventId && (
                <div className="bg-white rounded-lg shadow-sm p-4 mt-3">
                  <h3 className="text-lg font-medium text-textDark flex gap-2 items-center pb-[16px]">
                    <CalenderBigIcon /> Linked Event
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Event Name:</span>
                        <span className="font-medium text-gray-800">
                          {quote.eventName || "Unnamed Event"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-800">
                          {quote.eventData.eventDate
                            ? dayjs(quote.eventData.eventDate).format("DD MMM YYYY")
                            : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium text-gray-800">
                          {quote.eventData.eventTime || "Not set"}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/events/${quote.eventId}`}
                      className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      View Event Details
                    </Link>
                  </div>
                </div>
              )}
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

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateEventModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Create Event from Quote
                </h3>
                <button
                  onClick={() => setShowCreateEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Enter event name..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">
                    Event Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-800">
                        {customers.find((c) => c._id === quote.customerId)
                          ?.name || "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-800">
                        {quote.eventData.eventDate
                          ? dayjs(quote.eventData.eventDate).format(
                              "DD MMM YYYY"
                            )
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-800">
                        {quote.eventData.eventType || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-800">
                        {quote.eventData.location || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium text-gray-800">
                        {quote.eventData.guests || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium text-gray-800">
                        {items.length} product(s)
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-200">
                      <span className="text-gray-800 font-semibold">Total:</span>
                      <span className="font-bold text-purple-900">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This will create a new event with all
                    the information from this quote. Make sure all required
                    fields (customer, date, type, location) are filled.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateEventModal(false)}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createEventFromQuote}
                    disabled={creatingEvent}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {creatingEvent ? "Creating..." : "Create Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageHeader>
  );
}