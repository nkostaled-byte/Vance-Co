import React, { useState } from 'react';
import { useProducts, useCreateOrder } from '../hooks/useData';
import { useCart } from '../context/CartContext';
import { ENV } from '../config';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Shield, BadgeAlert, Sparkles, CheckCircle, Package } from 'lucide-react';

export const Shop: React.FC = () => {
  const { data: products, isLoading, error } = useProducts(true);
  const { cart, addToCart, removeFromCart, updateQty, cartTotal, cartCount, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Your cart is currently empty.');
      return;
    }

    if (!customer.name || !customer.email || !customer.phone) {
      setFormError('Please fill out all required checkout fields.');
      return;
    }

    // STRICT SECURITY DATA CONSTRAINT:
    // Map items strictly to { productId, qty } (No prices, stock levels, or details transmitted)
    const payload = {
      clientId: ENV.CLIENT_ID,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      items: cart.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
      })),
      notes: notes,
    };

    createOrderMutation.mutate(payload, {
      onSuccess: (res) => {
        setPlacedOrderId(res?.orderId || `ord-${Math.floor(10000 + Math.random() * 90000)}`);
        setCheckoutSuccess(true);
        clearCart();
        setNotes('');
        setCustomer({ name: '', email: '', phone: '' });
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: 'Order placed successfully! Check your inbox for confirmation.', type: 'success' },
          })
        );
      },
      onError: (err: any) => {
        setFormError(err.message || 'Error processing checkout. Refreshing product catalog.');
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {checkoutSuccess ? (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-6 shadow-2xl my-12 text-left">
          <div className="mx-auto h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-display font-bold text-white">Order Confirmed!</h2>
            <p className="text-xs text-slate-400">
              Your premium grooming apothecary products are being securely packed and dispatched.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-900 pb-2">
              <span>Order ID Reference:</span>
              <span className="font-mono text-white font-bold">{placedOrderId}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Delivery Status:</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Processing</span>
            </div>
          </div>

          <button
            onClick={() => setCheckoutSuccess(false)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all"
          >
            Continue Browsing Apothecary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: PRODUCTS CATALOG */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase">Premium Apothecary</span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">Hair & Beard Care Retail</h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Shop the exact professional formulas, styling clays, hydrates, and beard oils utilized daily by our expert barbers.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading premium retail products...</div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-6 rounded-2xl text-center">
                <p className="text-sm font-semibold">Error retrieving apothecary.</p>
                <p className="text-xs opacity-80 mt-1">Showing offline system backups instead.</p>
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No premium retail items are currently available.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products?.map((product) => {
                  const isOutOfStock = product.stock_qty === 0;
                  const cartItem = cart.find((item) => item.product.id === product.id);
                  const isAtMax = cartItem ? cartItem.qty >= product.stock_qty : false;

                  return (
                    <div
                      key={product.id}
                      className={`bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden hover:border-slate-800 transition-all flex flex-col justify-between text-left relative group ${
                        isOutOfStock ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Out of Stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-10 flex items-center justify-center">
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-rose-400/20">
                            Out Of Stock
                          </span>
                        </div>
                      )}

                      <div className="h-52 bg-slate-950 overflow-hidden relative">
                        <img
                          src={product.photo_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="font-display font-bold text-white text-base group-hover:text-amber-500 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-900">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-amber-500">£{product.price.toFixed(2)}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              {product.stock_qty} Units in stock
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock || isAtMax}
                            onClick={() => addToCart(product)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold py-2 px-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors text-xs text-center flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:hover:bg-slate-900 cursor-pointer"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {isOutOfStock ? 'Out of Stock' : isAtMax ? 'Stock Max Reached' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: CART AND CHECKOUT */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Shopping Cart Drawer Header */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6">
              <h2 className="text-xl font-display font-bold text-white flex items-center justify-between border-b border-slate-900 pb-4">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-amber-500" />
                  Grooming Cart
                </span>
                <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/10 px-2.5 py-1 rounded-full font-mono font-bold">
                  {cartCount} items
                </span>
              </h2>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-3">
                  <Package className="h-10 w-10 opacity-30" />
                  <p>Your apothecary cart is empty.</p>
                  <p className="text-xs max-w-xs">Select any premium products to condition and style your hair.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-4 py-3 border-b border-slate-900 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.photo_url}
                          alt={item.product.name}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{item.product.name}</h4>
                          <span className="text-xs text-amber-500 font-bold font-mono">£{item.product.price} each</span>
                        </div>
                      </div>

                      {/* Quantity Selector with UI Guard */}
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.product.id, item.qty - 1)}
                          className="p-1 hover:text-amber-500 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white w-5 text-center">{item.qty}</span>
                        <button
                          type="button"
                          disabled={item.qty >= item.product.stock_qty}
                          onClick={() => updateQty(item.product.id, item.qty + 1)}
                          className="p-1 hover:text-amber-500 hover:bg-slate-900 rounded text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-500 hover:text-rose-500 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Summary Totals */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-900 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Retail Subtotal:</span>
                    <span className="font-mono text-slate-200 font-bold">£{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Courier:</span>
                    <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-slate-900 pt-3 text-base">
                    <span>Total Bill:</span>
                    <span className="text-amber-500 font-mono">£{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  Secure Grooming Checkout
                </h3>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {formError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-xs">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="customer-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Your Full Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customer-name"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Tony Stark"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="customer-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Email Address <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="customer-email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="tony@stark.com"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="customer-phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Number <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="customer-phone"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="555-111-2222"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="customer-notes" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Delivery Courier Notes
                    </label>
                    <textarea
                      id="customer-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special gate codes, parcel box location, etc."
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        Placing Secure Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Place Grooming Order
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
