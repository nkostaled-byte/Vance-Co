import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Scissors, Calendar } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ENV } from '../../config';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname === '/login';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Shop', path: '/shop' },
    { name: 'Contact', path: '/contact' },
  ];

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="logo-link">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg group-hover:bg-amber-400 transition-colors">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-white">
              VANCE <span className="text-amber-500">&</span> CO.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" id="desktop-nav">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-amber-500 ${
                    isActive ? 'text-amber-500 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/shop"
              className="relative p-2 text-slate-300 hover:text-amber-500 transition-colors"
              id="desktop-cart-link"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/book"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-amber-500/10 flex items-center gap-2 text-sm"
              id="desktop-book-button"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Link>

            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-amber-500 border border-slate-800 px-3 py-1.5 rounded transition-colors"
            >
              Staff Portal
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-4 md:hidden">
            <Link
              to="/shop"
              className="relative p-2 text-slate-300 hover:text-amber-500"
              id="mobile-cart-link"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-amber-500 p-1"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 backdrop-blur-lg border-b border-slate-900 px-4 pt-2 pb-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-medium py-2 border-b border-slate-900 transition-colors ${
                    isActive ? 'text-amber-500 font-bold' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-center font-semibold py-3 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
              id="mobile-book-button"
            >
              <Calendar className="h-5 w-5" />
              Book Appointment
            </Link>

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-xs text-slate-400 hover:text-amber-500 border border-slate-900 py-2 rounded mt-2"
            >
              Staff Portal Login
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full" id="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer id="main-footer" className="bg-slate-950 border-t border-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 text-slate-950 p-2 rounded-lg">
                <Scissors className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-white">
                VANCE <span className="text-amber-500">&</span> CO.
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Crafting style and confidence with meticulously tailored haircuts, grooming rituals, and high-quality grooming products.
            </p>
          </div>

          {/* Column 2: Hours */}
          <div>
            <h3 className="font-display font-bold text-base tracking-wide text-white uppercase mb-4">Hours of Operation</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex justify-between py-1 border-b border-slate-900/50">
                <span>Monday - Friday</span>
                <span className="text-slate-200">9:00 AM - 7:00 PM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900/50">
                <span>Saturday</span>
                <span className="text-slate-200">9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Sunday</span>
                <span className="text-slate-400 italic">Closed</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="font-display font-bold text-base tracking-wide text-white uppercase mb-4">Quick Links</h3>
            <ul className="text-sm text-slate-400 space-y-2.5">
              <li>
                <Link to="/services" className="hover:text-amber-500 transition-colors">Our Services</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-500 transition-colors">Meet the Barbers</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-amber-500 transition-colors">E-Commerce Shop</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-500 transition-colors">Support & Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-display font-bold text-base tracking-wide text-white uppercase mb-4">The Shop</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              128 Heritage Way, Suite 400<br />
              London, EC1A 1BB<br />
              <span className="block mt-2 font-medium text-slate-200">Phone: +44 (0) 20 7946 0192</span>
              <span className="block text-slate-400 text-xs">Email: appointments@vanceandco.com</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Vance & Co. Barbershops. All rights reserved.</p>
          <p>Multi-Tenant Dashboard Isolation Secure Client ID: {ENV.CLIENT_ID}</p>
        </div>
      </footer>
    </div>
  );
};
