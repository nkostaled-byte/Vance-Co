import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useServices, useStaff, useCreateBooking } from '../hooks/useData';
import { ENV } from '../config';
import { Scissors, User, Calendar, ClipboardCheck, ArrowLeft, ArrowRight, CheckCircle2, Clock, CalendarDays, Phone, Mail } from 'lucide-react';

type BookingStep = 'service' | 'barber' | 'datetime' | 'details' | 'success';

export const Book: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data: services, isLoading: servicesLoading } = useServices(true);
  const { data: staffList, isLoading: staffLoading } = useStaff(true);
  const createBookingMutation = useCreateBooking();

  // State machine values
  const [step, setStep] = useState<BookingStep>('service');
  const [serviceId, setServiceId] = useState<string>('');
  const [staffId, setStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(''); // HH:MM
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  // Handle query params on mount for pre-selection
  useEffect(() => {
    const svcParam = searchParams.get('service');
    const bbrParam = searchParams.get('barber');
    if (svcParam) {
      setServiceId(svcParam);
      setStep('barber');
    }
    if (bbrParam) {
      setStaffId(bbrParam);
    }
  }, [searchParams]);

  // Generate next 10 days for calendar picker (excluding Sunday)
  const getDatesList = () => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      // Skip Sundays (barbershop is closed)
      if (nextDay.getDay() !== 0) {
        const year = nextDay.getFullYear();
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const day = String(nextDay.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const weekday = nextDay.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = nextDay.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        list.push({ dateStr, weekday, monthDay });
      }
    }
    return list;
  };

  // Generate 30-minute increment slots from 9:00 AM to 6:00 PM
  const getTimesList = () => {
    const times = [];
    const startHour = 9;
    const endHour = 18; // 6:00 PM

    for (let hour = startHour; hour < endHour; hour++) {
      const hStr = String(hour).padStart(2, '0');
      times.push(`${hStr}:00`);
      times.push(`${hStr}:30`);
    }
    return times;
  };

  const datesList = getDatesList();
  const timesList = getTimesList();

  // Set default date if none chosen
  useEffect(() => {
    if (!selectedDate && datesList.length > 0) {
      setSelectedDate(datesList[0].dateStr);
    }
  }, [selectedDate, datesList]);

  // Selected details lookup
  const selectedService = services?.find((s) => s.id === serviceId);
  const selectedStaff = staffList?.find((st) => st.id === staffId);

  const handleServiceSelect = (id: string) => {
    setServiceId(id);
    setStep('barber');
  };

  const handleBarberSelect = (id: string | null) => {
    setStaffId(id);
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    setStep('details');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.email || !customer.phone) return;

    // ISO 8601 formulation (Standard UTC mapping for reliable scheduling)
    const startTimeISO = `${selectedDate}T${selectedTime}:00.000Z`;

    const payload = {
      clientId: ENV.CLIENT_ID,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      serviceId,
      ...(staffId ? { staffId } : {}), // Optional UUID inclusion
      startTime: startTimeISO,
    };

    createBookingMutation.mutate(payload, {
      onSuccess: (res) => {
        setCreatedBookingId(res?.bookingId || `bkg-${Math.floor(1000 + Math.random() * 9000)}`);
        setStep('success');
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: 'Booking confirmed! Check your email for details.', type: 'success' },
          })
        );
      },
      onError: (err: any) => {
        console.error(err);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
      {/* Booking Breadcrumbs / Step Headers */}
      {step !== 'success' && (
        <div className="mb-10 flex items-center justify-between border-b border-slate-900 pb-6 overflow-x-auto gap-4">
          <div className="flex gap-4 min-w-max">
            <button
              onClick={() => serviceId && setStep('service')}
              className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                step === 'service' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
              Service
            </button>
            <span className="text-slate-800">/</span>
            <button
              onClick={() => serviceId && setStep('barber')}
              disabled={!serviceId}
              className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                step === 'barber' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
              Barber
            </button>
            <span className="text-slate-800">/</span>
            <button
              onClick={() => serviceId && setStep('datetime')}
              disabled={!serviceId}
              className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                step === 'datetime' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
              Schedule
            </button>
            <span className="text-slate-800">/</span>
            <button
              onClick={() => selectedDate && selectedTime && setStep('details')}
              disabled={!selectedDate || !selectedTime}
              className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                step === 'details' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-[10px]">4</span>
              Confirm Details
            </button>
          </div>

          {step !== 'service' && (
            <button
              onClick={() => {
                if (step === 'details') setStep('datetime');
                else if (step === 'datetime') setStep('barber');
                else if (step === 'barber') setStep('service');
              }}
              className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>
      )}

      {/* State Renderings */}
      <AnimatePresence mode="wait">
        {/* STEP 1: SERVICE SELECTION */}
        {step === 'service' && (
          <motion.div
            key="step-service"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Scissors className="h-5 w-5 text-amber-500" />
                Select a Grooming Service
              </h2>
              <p className="text-xs text-slate-400 mt-1">Select from our expert scissor, razor, and face treatments.</p>
            </div>

            {servicesLoading ? (
              <div className="text-center py-20 text-slate-400 text-sm">Retrieving services...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services?.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc.id)}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-4 h-44 group cursor-pointer ${
                      serviceId === svc.id
                        ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/5'
                        : 'bg-slate-900/20 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] tracking-wider uppercase bg-amber-500/5 text-amber-500 px-2 py-0.5 rounded border border-amber-500/10 font-bold">
                          {svc.category}
                        </span>
                        <span className="text-base font-bold text-slate-100 group-hover:text-amber-500 transition-colors">
                          £{svc.price.toFixed(2)}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-slate-100">{svc.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{svc.description}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>{svc.duration_minutes} mins</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: BARBER SELECTION */}
        {step === 'barber' && (
          <motion.div
            key="step-barber"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                Choose your Barber
              </h2>
              <p className="text-xs text-slate-400 mt-1">Select a specific artist or select First Available to match your schedule.</p>
            </div>

            {staffLoading ? (
              <div className="text-center py-20 text-slate-400 text-sm">Getting the schedule...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* First Available Card */}
                <button
                  onClick={() => handleBarberSelect(null)}
                  className={`p-6 rounded-2xl border text-left transition-all h-72 flex flex-col justify-between group cursor-pointer ${
                    staffId === null
                      ? 'bg-slate-900 border-amber-500'
                      : 'bg-slate-900/20 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="h-16 w-16 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Scissors className="h-8 w-8 animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-amber-500">First Available Barber</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Optimizes for your chosen time. Best if you need a quick slot or are open to any of our certified craftsmen.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">Fastest Match</span>
                </button>

                {staffList?.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleBarberSelect(staff.id)}
                    className={`p-4 rounded-2xl border text-left transition-all h-72 flex flex-col justify-between overflow-hidden group cursor-pointer ${
                      staffId === staff.id
                        ? 'bg-slate-900 border-amber-500'
                        : 'bg-slate-900/20 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <img
                        src={staff.photo_url}
                        alt={staff.name}
                        className="h-16 w-16 rounded-full object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-amber-500">{staff.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">{staff.bio}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Master Barber</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: DATE & TIME PICKER */}
        {step === 'datetime' && (
          <motion.div
            key="step-datetime"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Select Date & Time
              </h2>
              <p className="text-xs text-slate-400 mt-1">Book slots in 30-minute intervals. The shop is closed on Sundays.</p>
            </div>

            {/* Custom Horizontal Date Pill Selector */}
            <div className="space-y-3 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Choose Date</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-900">
                {datesList.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.dateStr);
                      setSelectedTime(''); // Reset time on date change
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[70px] shrink-0 transition-all cursor-pointer ${
                      selectedDate === d.dateStr
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-900/40 text-slate-300 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-70 font-semibold">{d.weekday}</span>
                    <span className="text-sm font-bold">{d.monthDay.split(' ')[0]}</span>
                    <span className="text-[10px]">{d.monthDay.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots Bento Grid */}
            <div className="space-y-3 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Choose Time Slot</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timesList.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                          : 'bg-slate-900/20 text-slate-300 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-slate-900 flex justify-end">
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={handleDateTimeConfirm}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-40"
              >
                Continue to Details
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: CUSTOMER DETAILS & REVIEW */}
        {step === 'details' && (
          <motion.div
            key="step-details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Form */}
            <div className="lg:col-span-7 bg-slate-900/20 border border-slate-900 rounded-3xl p-6 sm:p-8 text-left space-y-6">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-amber-500" />
                Enter Personal Details
              </h2>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="client-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Full Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="client-name"
                    name="name"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Marcus Vance"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="client-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="client-email"
                    name="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="marcus@vanceandco.com"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="client-phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Phone Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="client-phone"
                    name="phone"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+44 (0) 7700 900077"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Booking Now
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Booking Summary Receipt Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left space-y-6 h-fit">
              <h3 className="font-display font-bold text-white text-base uppercase tracking-wider border-b border-slate-800 pb-3">
                Booking Summary
              </h3>

              <div className="space-y-4 text-sm">
                {/* Selected Service */}
                {selectedService && (
                  <div className="flex gap-3">
                    <Scissors className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">{selectedService.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedService.description}</p>
                      <div className="flex gap-2 items-center text-xs text-slate-300 font-mono mt-1">
                        <span>{selectedService.duration_minutes} mins</span>
                        <span>•</span>
                        <span className="text-amber-500 font-bold">£{selectedService.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Barber */}
                <div className="flex gap-3 pt-3 border-t border-slate-800/60">
                  <User className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">
                      {selectedStaff ? selectedStaff.name : 'First Available Barber'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedStaff ? 'Master Craftsman' : 'Any certified team member'}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex gap-3 pt-3 border-t border-slate-800/60">
                  <CalendarDays className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h4>
                    <p className="text-xs text-amber-500 font-mono mt-0.5 font-bold">
                      {selectedTime} AM/PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: SUCCESS RECEIPT */}
        {step === 'success' && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative"
          >
            <div className="mx-auto h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-white">Appointment Confirmed!</h2>
              <p className="text-xs text-slate-400">
                Your grooming appointment has been officially logged in our system. A calendar invitation has been dispatched.
              </p>
            </div>

            {/* Receipt Summary block */}
            <div className="bg-slate-950 border border-slate-900/80 rounded-2xl p-5 text-left space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-900 pb-2">
                <span>Booking ID:</span>
                <span className="font-mono text-white font-bold">{createdBookingId}</span>
              </div>

              {selectedService && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Grooming Ritual</span>
                  <div className="flex justify-between text-xs text-white">
                    <span>{selectedService.name}</span>
                    <span className="font-semibold text-amber-500">£{selectedService.price.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1 border-t border-slate-900 pt-2">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Scheduled Slots</span>
                <div className="flex items-center gap-1.5 text-xs text-white">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at <span className="font-bold text-amber-500">{selectedTime}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-900 pt-2">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Craftsman Assigned</span>
                <div className="text-xs text-white flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-500" />
                  <span>{selectedStaff ? selectedStaff.name : 'First Available Barber'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setServiceId('');
                  setStaffId(null);
                  setSelectedTime('');
                  setCustomer({ name: '', email: '', phone: '' });
                  setStep('service');
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md"
              >
                Book Another Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
