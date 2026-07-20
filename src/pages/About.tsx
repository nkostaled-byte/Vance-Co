import React from 'react';
import { useStaff } from '../hooks/useData';
import { Scissors, ShieldCheck, Award, ThumbsUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  const { data: staffList, isLoading, error } = useStaff(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase">Our Story</span>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">Meet the Vance Craftsmen</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Our team is composed of award-winning, licensed hair professionals devoted to classical symmetry, clean hairlines, and absolute client satisfaction.
        </p>
      </div>

      {/* Staff Cards Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-slate-400 text-sm mt-4">Inviting the master barbers...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-6 rounded-2xl text-center max-w-md mx-auto">
          <p className="text-sm font-semibold">Could not load staff.</p>
          <p className="text-xs opacity-80 mt-1">Showing our standard standby crew instead.</p>
        </div>
      ) : staffList && staffList.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Our barbers are currently off duty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {staffList?.map((staff) => (
            <div
              key={staff.id}
              className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all flex flex-col justify-between text-left group"
              id={`staff-card-${staff.id}`}
            >
              <div className="relative h-80 overflow-hidden bg-slate-950">
                <img
                  src={staff.photo_url}
                  alt={staff.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-amber-500 transition-colors">
                    {staff.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {staff.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                    Expert Barber
                  </span>
                  <Link
                    to={`/book?barber=${staff.id}`}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    Book with {staff.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust Badges section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-900">
        <div className="flex gap-4 text-left">
          <div className="bg-amber-500/10 text-amber-500 p-3 h-12 w-12 rounded-xl shrink-0 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-display font-bold text-base">Certified Master Barbers</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every chair is operated by an authorized master craftsman who undergoes rigorous ongoing styled hair training.
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-left">
          <div className="bg-amber-500/10 text-amber-500 p-3 h-12 w-12 rounded-xl shrink-0 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-display font-bold text-base">Sterilized Styling Kits</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We employ professional autoclave sanitization units for clippers, guards, straight razors, and combs after every single appointment.
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-left">
          <div className="bg-amber-500/10 text-amber-500 p-3 h-12 w-12 rounded-xl shrink-0 flex items-center justify-center">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-display font-bold text-base">Customer-First Service</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We focus purely on you. Enjoy custom music, chilled beverages, a charging station, and personal conversation in a private setting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
