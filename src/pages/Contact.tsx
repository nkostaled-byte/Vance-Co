import React, { useState } from 'react';
import { useSubmitContactForm } from '../hooks/useData';
import { ENV } from '../config';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const submitInquiry = useSubmitContactForm();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot field
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccess(false);

    // SECURITY FEATURE: HONEYPOT CHECK
    // If the hidden 'website' input has a value, it means a bot has auto-filled the form.
    // We instantly simulate a success or abort submission quietly.
    if (formState.website) {
      console.warn('Honeypot triggered! Bot submission caught and discarded.');
      setSubmitSuccess(true);
      setFormState({ name: '', email: '', message: '', website: '' });
      return;
    }

    if (!formState.name || !formState.email || !formState.message) {
      setFormError('Please fill out all required fields.');
      return;
    }

    const payload = {
      clientId: ENV.CLIENT_ID,
      formName: 'Contact Inquiry',
      customer: {
        name: formState.name,
        email: formState.email,
      },
      fields: {
        message: formState.message,
      },
      website: '', // honeypot transmitted empty
    };

    submitInquiry.mutate(payload, {
      onSuccess: () => {
        setSubmitSuccess(true);
        setFormState({ name: '', email: '', message: '', website: '' });
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: { message: 'Inquiry submitted successfully! We will get in touch.', type: 'success' },
          })
        );
      },
      onError: (err: any) => {
        setFormError(err.message || 'Error sending message. Please try again.');
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase">Get in Touch</span>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">Contact & Support</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Have an inquiry about corporate bookings, weddings, or private events? Drop us a note and we will reply within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Contact Info */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white">Let’s Chat</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Whether you need to adjust an appointment or purchase a custom batch of retail beard balms, our help desk is open.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-slate-900/40 border border-slate-900 text-amber-500 p-3 rounded-xl shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Our Location</h4>
                <p className="text-xs text-slate-400 mt-1">128 Heritage Way, Suite 400, London</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-slate-900/40 border border-slate-900 text-amber-500 p-3 rounded-xl shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Call Support</h4>
                <p className="text-xs text-slate-400 mt-1">+44 (0) 20 7946 0192</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-slate-900/40 border border-slate-900 text-amber-500 p-3 rounded-xl shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Email Inbox</h4>
                <p className="text-xs text-slate-400 mt-1">appointments@vanceandco.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Contact Form */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-900/80 rounded-3xl p-8 text-left relative">
          <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Send a Message
          </h3>

          {submitSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
              <div className="space-y-1">
                <h4 className="text-base font-bold">Message Received!</h4>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. A Vance & Co. representative will review your message and reach out shortly.
                </p>
              </div>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-xs text-amber-500 font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Bot Honeypot Input - Absolutely Hidden Visually */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website" className="text-xs text-slate-400">
                  Your Website (Leave Blank)
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formState.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="w-full bg-transparent border-none py-1 focus:ring-0"
                />
              </div>

              {/* Real Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Full Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Marcus Vance"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="marcus@vanceandco.com"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Your Message <span className="text-amber-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="Tell us about your event, wedding timeline, or special grooming request..."
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitInquiry.isPending}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {submitInquiry.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Support Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
