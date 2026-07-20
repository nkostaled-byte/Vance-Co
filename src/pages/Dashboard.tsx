import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings, useOrders, useProducts, useInvoices, useSubmissions, useCreateInvoice, useSendInvoice, useUpdateProduct } from '../hooks/useData';
import { ENV } from '../config';
import {
  Scissors, Calendar, ShoppingCart, DollarSign, Inbox, FileText, Download, UploadCloud,
  Layers, ToggleLeft, ToggleRight, Plus, CheckCircle, Clock, X, LogOut, ChevronRight,
  Sparkles, FileSpreadsheet, Package, RefreshCw, Trash2
} from 'lucide-react';

type DashboardTab = 'bookings' | 'orders-inventory' | 'invoices' | 'submissions' | 'actions';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('bookings');
  const [adminEmail, setAdminEmail] = useState('admin@vanceandco.com');

  // SECURE ROUTE GUARD: Ensure active session
  useEffect(() => {
    const sessionKey = `sb-${ENV.CLIENT_ID}-auth-token`;
    const token = localStorage.getItem(sessionKey) || localStorage.getItem('supabase.auth.token');
    if (!token) {
      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: { message: 'Authentication required. Redirecting to login.', type: 'warning' },
        })
      );
      navigate('/login');
    } else {
      try {
        const parsed = JSON.parse(token);
        const email = parsed?.currentSession?.user?.email || parsed?.user?.email;
        if (email) setAdminEmail(email);
      } catch (_) {}
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem(`sb-${ENV.CLIENT_ID}-auth-token`);
    localStorage.removeItem('supabase.auth.token');
    window.dispatchEvent(
      new CustomEvent('app_toast', {
        detail: { message: 'Logged out of staff workspace.', type: 'success' },
      })
    );
    navigate('/login');
  };

  // Queries
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: invoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices();
  const { data: submissions = [], isLoading: submissionsLoading, refetch: refetchSubmissions } = useSubmissions();

  // Mutations
  const createInvoiceMutation = useCreateInvoice();
  const sendInvoiceMutation = useSendInvoice();
  const updateProductMutation = useUpdateProduct();

  // State managers
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    amount: 0,
    description: '',
  });

  // Media upload state
  const [uploadFolder, setUploadFolder] = useState<'products' | 'profile' | 'logos'>('products');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Stats calculation
  const totalBookings = bookings.length;
  const totalRevenue = orders.reduce((acc, ord) => acc + ord.total_amount, 0) + 
                        invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0);
  const activeInvoicesCount = invoices.filter(inv => inv.status === 'sent').length;
  const totalInquiries = submissions.length;

  // Handle product stock change
  const handleStockIncrement = (productId: string, currentStock: number) => {
    updateProductMutation.mutate({ productId, stock_qty: currentStock + 1 }, {
      onSuccess: () => {
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: 'Stock quantity incremented.', type: 'success' },
          })
        );
      }
    });
  };

  const handleStockDecrement = (productId: string, currentStock: number) => {
    if (currentStock <= 0) return;
    updateProductMutation.mutate({ productId, stock_qty: currentStock - 1 });
  };

  const handleProductVisibilityToggle = (productId: string, currentHidden: boolean) => {
    updateProductMutation.mutate({ productId, is_hidden: !currentHidden }, {
      onSuccess: () => {
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: `Product visibility ${!currentHidden ? 'hidden' : 'visible'}.`, type: 'success' },
          })
        );
      }
    });
  };

  // Create Manual Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.customerName || !newInvoice.customerEmail || !newInvoice.customerPhone || newInvoice.amount <= 0) {
      alert('Please fill in all invoice details.');
      return;
    }

    const payload = {
      clientId: ENV.CLIENT_ID,
      customerName: newInvoice.customerName,
      customerEmail: newInvoice.customerEmail,
      customerPhone: newInvoice.customerPhone,
      amount: Number(newInvoice.amount),
      description: newInvoice.description || 'Grooming service bundle & care apothecary.',
    };

    createInvoiceMutation.mutate(payload, {
      onSuccess: () => {
        setInvoiceModalOpen(false);
        setNewInvoice({ customerName: '', customerEmail: '', customerPhone: '', amount: 0, description: '' });
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: 'Manual invoice created and added to history.', type: 'success' },
          })
        );
      },
    });
  };

  // Dispatch Send Invoice
  const handleSendInvoice = (invoiceId: string) => {
    sendInvoiceMutation.mutate(invoiceId, {
      onSuccess: () => {
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: 'Invoice dispatch request triggered successfully!', type: 'success' },
          })
        );
        refetchInvoices();
      },
    });
  };

  // Global Actions - CSV Export
  const handleExportTable = (tableName: string) => {
    // Generate secure export URL pointing directly to CF API
    const sessionKey = `sb-${ENV.CLIENT_ID}-auth-token`;
    const tokenObjStr = localStorage.getItem(sessionKey) || localStorage.getItem('supabase.auth.token');
    let jwt = '';
    if (tokenObjStr) {
      try {
        jwt = JSON.parse(tokenObjStr)?.currentSession?.access_token || JSON.parse(tokenObjStr)?.access_token || '';
      } catch (_) {}
    }

    const exportUrl = `${ENV.API_BASE_URL.replace(/\/$/, '')}/api/export/${tableName}?clientId=${ENV.CLIENT_ID}&auth=${encodeURIComponent(jwt)}`;
    window.open(exportUrl, '_blank');
  };

  // Global Actions - Media Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large! Maximum limit is 5MB.');
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(null);
    }
  };

  const handleMediaUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadSuccess(null);

    try {
      // Extract JWT securely
      const sessionKey = `sb-${ENV.CLIENT_ID}-auth-token`;
      const tokenObjStr = localStorage.getItem(sessionKey) || localStorage.getItem('supabase.auth.token');
      let jwt = '';
      if (tokenObjStr) {
        try {
          const parsed = JSON.parse(tokenObjStr);
          jwt = parsed?.currentSession?.access_token || parsed?.access_token || '';
        } catch (_) {}
      }

      // Convert file to raw bytes ArrayBuffer
      const fileBytes = await selectedFile.arrayBuffer();

      const uploadUrl = `${ENV.API_BASE_URL.replace(/\/$/, '')}/api/upload?folder=${uploadFolder}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': selectedFile.type,
        },
        body: fileBytes,
      });

      if (!response.ok) {
        throw new Error(`Upload failed. Status: ${response.status}`);
      }

      const resJson = await response.json();
      setUploadSuccess(resJson?.url || 'File successfully uploaded to static bucket!');
      setSelectedFile(null);
      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: { message: 'Media assets dispatched and uploaded successfully.', type: 'success' },
        })
      );
    } catch (err: any) {
      console.error(err);
      alert(`Media upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between py-6 px-4">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              VANCE STAFF
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0" aria-label="Sidebar navigation">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTab === 'bookings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Bookings Tracker
            </button>

            <button
              onClick={() => setActiveTab('orders-inventory')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTab === 'orders-inventory' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Orders & Inventory
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTab === 'invoices' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="h-4 w-4" />
              Billing Invoices
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTab === 'submissions' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Inbox className="h-4 w-4" />
              Inbox Inquiries
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTab === 'actions' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="h-4 w-4" />
              Admin Toolkit
            </button>
          </nav>
        </div>

        {/* User context footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-3 mt-4">
          <div className="text-left px-2">
            <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Logged In As</p>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{adminEmail}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-rose-950/20 text-xs font-semibold text-slate-400 hover:text-rose-400 border border-slate-800 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* MAIN DISPLAY AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 text-left">
        {/* Real-time metrics bar */}
        <section id="metrics-bar" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booked Clients</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{totalBookings}</span>
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-500">£{totalRevenue.toFixed(2)}</span>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Invoices</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-500">{activeInvoicesCount}</span>
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Inbox Submissions</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-400">{totalInquiries}</span>
              <Inbox className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </section>

        {/* Dynamic Display Area */}
        <section id="dashboard-tab-content">
          {/* TAB 1: BOOKINGS TRACKER */}
          {activeTab === 'bookings' && (
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Upcoming Appointments</h2>
                  <p className="text-xs text-slate-400 mt-1">Real-time schedule logs fetched from the bookings database.</p>
                </div>
                <button
                  onClick={refetchBookings}
                  className="p-2 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Refresh bookings"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {bookingsLoading ? (
                <div className="py-20 text-center text-slate-500 text-sm">Synchronizing schedule data...</div>
              ) : bookings.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">No scheduled bookings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">Customer</th>
                        <th className="py-3 px-4 font-semibold">Service ID</th>
                        <th className="py-3 px-4 font-semibold">Barber Assignment</th>
                        <th className="py-3 px-4 font-semibold">Start Time (ISO)</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        let statusColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                        if (booking.status === 'confirmed') statusColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                        if (booking.status === 'completed') statusColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                        if (booking.status === 'cancelled') statusColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                        return (
                          <tr key={booking.id} className="border-b border-slate-850/50 hover:bg-slate-850/10 last:border-0">
                            <td className="py-3.5 px-4 font-medium text-white">
                              <div>{booking.customer_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{booking.customer_email} • {booking.customer_phone}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{booking.service_id.substring(0, 8)}...</td>
                            <td className="py-3.5 px-4 text-xs text-slate-300">
                              {booking.staff_id ? `Barber ID: ${booking.staff_id.substring(0, 8)}...` : 'First Available'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                              {new Date(booking.start_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${statusColor}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS & INVENTORY VIEW */}
          {activeTab === 'orders-inventory' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left: Orders History (40%) */}
              <div className="xl:col-span-5 bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
                <h3 className="text-lg font-display font-bold text-white border-b border-slate-800 pb-3">Chronological Orders</h3>

                {ordersLoading ? (
                  <div className="py-12 text-center text-slate-500 text-sm">Syncing shop logs...</div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">No shop orders processed yet.</div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-white">{ord.customer_name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">{ord.customer_email}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-400 font-mono">£{ord.total_amount.toFixed(2)}</span>
                        </div>

                        {ord.notes && (
                          <p className="text-[11px] text-slate-400 italic bg-slate-900 p-2 rounded border border-slate-900/40">
                            Notes: "{ord.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900/40">
                          <span className="font-mono">ID: {ord.id.substring(0, 8)}...</span>
                          <span>
                            {new Date(ord.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Real-time Inventory Management Grid (60%) */}
              <div className="xl:col-span-7 bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-display font-bold text-white">Inventory Apothecary Registry</h3>
                  <span className="text-xs text-amber-500 font-semibold font-mono">Products Table</span>
                </div>

                {productsLoading ? (
                  <div className="py-12 text-center text-slate-500 text-sm">Syncing product quantities...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-xs text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3 font-semibold">Item</th>
                          <th className="py-2.5 px-3 font-semibold">Apothecary Rate</th>
                          <th className="py-2.5 px-3 font-semibold">Stock Level</th>
                          <th className="py-2.5 px-3 font-semibold">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => (
                          <tr key={prod.id} className="border-b border-slate-850/40 hover:bg-slate-850/5 last:border-0">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.photo_url}
                                  alt={prod.name}
                                  className="h-8 w-8 rounded object-cover border border-slate-850"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-medium text-white text-xs">{prod.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-300 text-xs">£{prod.price.toFixed(2)}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStockDecrement(prod.id, prod.stock_qty)}
                                  className="h-6 w-6 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono font-bold text-white w-6 text-center">{prod.stock_qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleStockIncrement(prod.id, prod.stock_qty)}
                                  className="h-6 w-6 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => handleProductVisibilityToggle(prod.id, prod.is_hidden)}
                                className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider transition-colors cursor-pointer ${
                                  prod.is_hidden
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                }`}
                              >
                                {prod.is_hidden ? 'Hidden' : 'Visible'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BILLING INVOICES */}
          {activeTab === 'invoices' && (
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Billing & Manual Invoices</h2>
                  <p className="text-xs text-slate-400 mt-1">Generate or dispatch customized invoices to specific clients.</p>
                </div>

                <button
                  onClick={() => setInvoiceModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Create Manual Invoice
                </button>
              </div>

              {invoicesLoading ? (
                <div className="py-20 text-center text-slate-500 text-sm">Syncing invoices history...</div>
              ) : invoices.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">No billing records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">Client Name</th>
                        <th className="py-3 px-4 font-semibold">Email & Phone</th>
                        <th className="py-3 px-4 font-semibold">Invoice Description</th>
                        <th className="py-3 px-4 font-semibold">Bill Amount</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-slate-850/50 hover:bg-slate-850/10 last:border-0">
                          <td className="py-3.5 px-4 font-bold text-white text-xs sm:text-sm">{inv.customer_name}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                            <div>{inv.customer_email}</div>
                            <div className="mt-0.5">{inv.customer_phone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">{inv.description || 'Grooming service package'}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white text-xs sm:text-sm">£{inv.amount.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                              inv.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : inv.status === 'sent'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => handleSendInvoice(inv.id)}
                                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-500 hover:text-amber-400 text-[10px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer"
                              >
                                Dispatch Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INBOX INQUIRIES FORM SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Inquiries Inbox</h2>
                  <p className="text-xs text-slate-400 mt-1">Forms inquiries submitted directly by the public Contact form.</p>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1 rounded border border-amber-500/15 font-mono font-bold">
                  {submissions.length} Total Messages
                </span>
              </div>

              {submissionsLoading ? (
                <div className="py-20 text-center text-slate-500 text-sm">Syncing inquiries inbox...</div>
              ) : submissions.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">No client submissions in this folder.</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 text-left">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-200 text-sm sm:text-base">{sub.customer_name}</h3>
                          <span className="text-[10px] uppercase font-mono text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                            {sub.form_name}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500">{sub.customer_email}</p>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 bg-slate-900/10 italic rounded">
                          "{sub.message}"
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(sub.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADMIN ACTION PANELS (CSV EXPORTS & MEDIA UPLOADS) */}
          {activeTab === 'actions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CSV Exports */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-amber-500" />
                    CSV Data Export Central
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Download raw databases directly from the CF Worker export endpoints.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'bookings', label: 'Bookings Logs' },
                    { id: 'orders', label: 'E-commerce Orders' },
                    { id: 'products', label: 'Products Master' },
                    { id: 'invoices', label: 'Historical Invoices' },
                    { id: 'submissions', label: 'Contact Submissions' },
                    { id: 'customers', label: 'Customer Registry' },
                  ].map((table) => (
                    <button
                      key={table.id}
                      onClick={() => handleExportTable(table.id)}
                      className="flex items-center justify-between p-4 bg-slate-950 border border-slate-900 hover:border-amber-500/20 rounded-2xl text-left hover:bg-slate-950/80 transition-all cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-500 transition-colors">{table.label}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">GET /api/export/{table.id}</span>
                      </div>
                      <Download className="h-4 w-4 text-slate-500 group-hover:text-amber-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Upload Engine */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-amber-500" />
                    Binary Media Uploader
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Converts assets to raw binary buffers and dispatches under 5MB.</p>
                </div>

                <div className="space-y-4">
                  {/* Select Destination Folder */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload Destination</label>
                    <div className="flex gap-2">
                      {['products', 'profile', 'logos'].map((folder) => (
                        <button
                          key={folder}
                          type="button"
                          onClick={() => setUploadFolder(folder as any)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border uppercase tracking-wider transition-all cursor-pointer ${
                            uploadFolder === folder
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-900'
                          }`}
                        >
                          {folder}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drag and Drop Box */}
                  <div className="border border-dashed border-slate-800 hover:border-slate-750 bg-slate-950/40 rounded-2xl p-6 text-center space-y-3 relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="dashboard-file-input"
                    />
                    <div className="mx-auto h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-bold text-amber-500 truncate max-w-xs mx-auto">
                          {selectedFile.name}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-slate-300">Drag & Drop Image Here</p>
                        <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleMediaUpload}
                      disabled={uploading}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {uploading ? 'Processing raw bytes binary upload...' : `Upload to /folder=${uploadFolder}`}
                    </button>
                  )}

                  {uploadSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs break-all text-center">
                      <p className="font-bold">Media Upload Successfully Confirmed!</p>
                      <a href={uploadSuccess} target="_blank" rel="noreferrer" className="underline block mt-1 text-[11px] font-mono text-emerald-400">
                        {uploadSuccess}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL: MANUAL INVOICE GENERATOR */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative shadow-2xl">
            <button
              onClick={() => setInvoiceModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
              aria-label="Close invoice dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-display font-bold text-white">Create Manual Invoice</h3>
              <p className="text-xs text-slate-400 mt-1">Fills client metadata and amounts, saving straight to invoice tables.</p>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newInvoice.customerName}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Tony Stark"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</label>
                  <input
                    type="email"
                    required
                    value={newInvoice.customerEmail}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="tony@stark.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newInvoice.customerPhone}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="555-111-2222"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount (£)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newInvoice.amount || ''}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea
                  rows={3}
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Premium corporate styling sessions & hydrating mask bundle pack."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Log Manual Invoice Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
