import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useData';
import { Clock, Scissors, Star, Shield, ArrowRight } from 'lucide-react';

export const Services: React.FC = () => {
  const { data: services, isLoading, error } = useServices(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Group services by category
  const categories = services
    ? ['All', ...Array.from(new Set(services.map((s) => s.category)))]
    : ['All'];

  const filteredServices = services
    ? selectedCategory === 'All'
      ? services
      : services.filter((s) => s.category === selectedCategory)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase">Grooming Menu</span>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">Services & Pricing</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Meticulous barbering craftsmanship customized for your hair density, beard alignment, and personal style. Select your treatment and secure an appointment.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
              selectedCategory === category
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/10 font-bold'
                : 'bg-slate-900/40 text-slate-300 border-slate-900 hover:border-slate-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Services Grid/List */}
      {isLoading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-slate-400 text-sm mt-4">Retrieving active grooming catalog...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-6 rounded-2xl text-center max-w-md mx-auto">
          <p className="text-sm font-semibold">Could not load services.</p>
          <p className="text-xs opacity-80 mt-1">Showing high-fidelity offline system backups instead.</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No active services found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-slate-900/30 border border-slate-900/60 hover:border-amber-500/20 p-6 rounded-2xl flex flex-col justify-between hover:bg-slate-900/40 transition-all text-left group"
              id={`service-card-${service.id}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold bg-amber-500/5 border border-amber-500/10 px-2.5 py-0.5 rounded-md">
                    {service.category}
                  </span>
                  <span className="text-xl font-bold font-display text-white group-hover:text-amber-500 transition-colors">
                    £{service.price.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-display font-bold text-slate-100">{service.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{service.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900/80 pt-4 mt-6">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>{service.duration_minutes} mins duration</span>
                </div>

                <Link
                  to={`/book?service=${service.id}`}
                  className="inline-flex items-center gap-1 text-xs text-amber-500 group-hover:text-amber-400 font-bold transition-colors"
                >
                  Select & Book
                  <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brand Pledge / Callout */}
      <div className="bg-gradient-to-r from-slate-900/40 via-slate-950 to-slate-900/40 border border-slate-900 rounded-3xl p-8 max-w-4xl mx-auto flex flex-col sm:flex-row gap-8 items-center text-left">
        <div className="bg-amber-500/10 text-amber-500 p-4 rounded-full shrink-0">
          <Scissors className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h4 className="font-display font-bold text-white text-lg">Vance Craftsmanship Guarantee</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every service is backed by our full style satisfaction guarantee. If your cut, line-up, or shave isn't exactly to your liking, inform your barber before checking out and we will refine it until you are completely proud of your style.
          </p>
        </div>
      </div>
    </div>
  );
};
