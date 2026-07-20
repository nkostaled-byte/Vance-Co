import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Clock, MapPin, Scissors, ShieldCheck, Heart } from 'lucide-react';
import { useServices, useProducts } from '../hooks/useData';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Oliver Thorne',
    role: 'Loyal Client since 2023',
    quote: 'Absolutely the best haircut experience in the city. Marcus has an unbelievable attention to detail. The hot towel straight shave is an essential self-care ritual for me now.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Christian Bale',
    role: 'Corporate Executive',
    quote: 'Sofia completely understood my styling. Very professional, relaxed atmosphere, and the sandalwood pomade smells incredible. Worth every single penny.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Aiden Brooks',
    role: 'Creative Designer',
    quote: 'Dorian lined up my beard like a surgeon. The skin fade is razor sharp and symmetric. Extremely clean shop, wonderful music selection, and great conversations.',
    rating: 5,
  },
];

export const Home: React.FC = () => {
  const { data: services, isLoading: servicesLoading } = useServices(true);
  const { data: products, isLoading: productsLoading } = useProducts(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const featuredServices = services ? services.slice(0, 4) : [];
  const featuredProducts = products ? products.slice(0, 4) : [];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section id="hero-section" className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 py-24 md:py-36 border-b border-slate-900 px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Scissors className="h-3 w-5 animate-pulse" />
              Legendary Grooming Excellence
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white leading-[1.1]">
              Crafting Your Distinctive <span className="text-amber-500">Visual Style</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              Vance & Co. blends traditional barbershop craftsmanship with modern aesthetic techniques. Walk in for an extraordinary look, walk out with absolute confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/book"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-center font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all text-base transform hover:-translate-y-0.5"
                id="hero-book-cta"
              >
                Book Appointment Now
              </Link>
              <Link
                to="/services"
                className="bg-transparent hover:bg-slate-900 text-white border border-slate-800 hover:border-slate-700 text-center font-semibold px-8 py-4 rounded-xl transition-all text-base"
                id="hero-services-cta"
              >
                Explore Services & Rates
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl blur-2xl"></div>
            <div className="relative border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2 bg-slate-900/40 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80"
                alt="Premium barbershop interior, leather styling chairs"
                className="rounded-2xl w-full h-[380px] object-cover filter brightness-95 contrast-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPS */}
      <section id="values-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/30 border border-slate-900/60 p-8 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Scissors className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white">Expert Artisans</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our barbers are vetted masters of hair density, growth directions, facial morphology, and traditional straight-razor techniques.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-900/60 p-8 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white">Top-Tier Products</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We use and retail only the premium formulations that hydrate skin cells, condition hair follicles, and offer highly flexible styles.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-900/60 p-8 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white">Honorable Service</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We respect your timeline. All bookings are strictly on-time. No long queue waiting, just pure, uninterrupted grooming rituals.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES (HORIZONTAL SLIDER) */}
      <section id="featured-services" className="space-y-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <h2 className="text-xs uppercase tracking-widest text-amber-500 font-bold">Menu Highlights</h2>
            <h3 className="text-3xl font-display font-bold text-white">Signature Grooming Services</h3>
          </div>
          <Link
            to="/services"
            className="text-amber-500 hover:text-amber-400 font-semibold text-sm inline-flex items-center gap-1 group self-start sm:self-auto"
          >
            View Full Service Menu
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Scrollable grid */}
        <div className="max-w-7xl mx-auto overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex gap-6 min-w-max px-2">
            {servicesLoading ? (
              <div className="w-full text-slate-400 py-12 text-center font-medium">Retrieving service menu...</div>
            ) : (
              featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="w-80 bg-slate-900/40 border border-slate-900/80 p-6 rounded-2xl hover:border-amber-500/30 transition-all group flex flex-col justify-between h-64 text-left"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">
                      {service.category}
                    </span>
                    <h4 className="text-lg font-display font-bold text-white group-hover:text-amber-500 transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {service.duration_minutes} mins
                    </div>
                    <span className="text-lg font-bold text-amber-500">
                      £{service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. SHOP HIGHLIGHTS (HORIZONTAL SLIDER) */}
      <section id="shop-highlights" className="space-y-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <h2 className="text-xs uppercase tracking-widest text-amber-500 font-bold">Premium Retail</h2>
            <h3 className="text-3xl font-display font-bold text-white">Vance Grooming Apothecary</h3>
          </div>
          <Link
            to="/shop"
            className="text-amber-500 hover:text-amber-400 font-semibold text-sm inline-flex items-center gap-1 group self-start sm:self-auto"
          >
            Explore Apothecary
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Scrollable products */}
        <div className="max-w-7xl mx-auto overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex gap-6 min-w-max px-2">
            {productsLoading ? (
              <div className="w-full text-slate-400 py-12 text-center">Loading premium products...</div>
            ) : (
              featuredProducts.map((product) => {
                const isOutOfStock = product.stock_qty === 0;
                return (
                  <div
                    key={product.id}
                    className="w-72 bg-slate-900/20 border border-slate-900/80 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all flex flex-col justify-between text-left relative group"
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-10 flex items-center justify-center">
                        <span className="bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="h-56 overflow-hidden bg-slate-950 relative">
                      <img
                        src={product.photo_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-white text-base truncate group-hover:text-amber-500 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900/50">
                        <span className="text-lg font-bold text-amber-500">
                          £{product.price.toFixed(2)}
                        </span>
                        <Link
                          to="/shop"
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-amber-500 font-semibold px-3 py-1.5 rounded transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SLIDER */}
      <section id="testimonials-section" className="bg-slate-900/20 py-20 border-y border-slate-900 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-10 relative">
          <div className="flex justify-center">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
              ))}
            </div>
          </div>

          <div className="min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <blockquote className="text-xl md:text-2xl font-light italic text-slate-200 leading-relaxed max-w-3xl mx-auto">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </blockquote>
                <div>
                  <cite className="not-italic text-white font-display font-bold text-base block">
                    {TESTIMONIALS[activeTestimonial].name}
                  </cite>
                  <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
                    {TESTIMONIALS[activeTestimonial].role}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="p-2.5 rounded-full border border-slate-800 hover:border-amber-500 hover:text-amber-500 transition-colors bg-slate-950"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2.5 rounded-full border border-slate-800 hover:border-amber-500 hover:text-amber-500 transition-colors bg-slate-950"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION / APPOINTMENT PROMPT */}
      <section id="location-and-cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 p-8 md:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 text-left">
            <h3 className="text-3xl font-display font-bold text-white">Experience Luxury Grooming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Step into an atmosphere of relaxation and refinement. We are located in the heart of London. Let our experienced barbers tailor a customized look for you.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <MapPin className="h-5 w-5 text-amber-500 shrink-0" />
                <span>128 Heritage Way, Suite 400, London</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                <span>Mon-Sat: 9:00 AM - 7:00 PM (Sat till 6PM)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-900/80">
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-2">Book instant</p>
            <h4 className="text-white text-xl font-display font-semibold mb-6">Ready to upgrade your look?</h4>
            <Link
              to="/book"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-center shadow-lg hover:shadow-amber-500/20 transition-all text-sm"
              id="cta-instant-book"
            >
              Secure Your Slot Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
