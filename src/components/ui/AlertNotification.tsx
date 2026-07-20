import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface BannerItem {
  message: string;
  type: string;
}

export const AlertNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [banner, setBanner] = useState<BannerItem | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message, type = 'info' } = customEvent.detail || {};
      if (message) {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove in 4 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }
    };

    const handleBanner = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message, type = 'info' } = customEvent.detail || {};
      if (message) {
        setBanner({ message, type });
      }
    };

    const handleAuthRequired = () => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [
        ...prev,
        { id, message: 'Please sign in to access the owner dashboard.', type: 'warning' },
      ]);
    };

    window.addEventListener('app_toast', handleToast);
    window.addEventListener('app_banner', handleBanner);
    window.addEventListener('auth_required', handleAuthRequired);

    return () => {
      window.removeEventListener('app_toast', handleToast);
      window.removeEventListener('app_banner', handleBanner);
      window.removeEventListener('auth_required', handleAuthRequired);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center pointer-events-none">
      {/* Rate Limit / Warning Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            id="global-alert-banner"
            className="w-full bg-amber-500 text-slate-950 font-medium px-4 py-3 shadow-lg flex items-center justify-between pointer-events-auto"
          >
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{banner.message}</span>
              <button
                onClick={() => setBanner(null)}
                className="ml-auto hover:bg-amber-600/30 p-1 rounded transition-colors"
                aria-label="Close banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Area */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bg = 'bg-slate-900 border-slate-800 text-slate-100';
            let Icon = Info;
            let iconColor = 'text-blue-400';

            if (toast.type === 'success') {
              bg = 'bg-slate-900 border-emerald-950 text-slate-100';
              Icon = CheckCircle2;
              iconColor = 'text-emerald-500';
            } else if (toast.type === 'warning') {
              bg = 'bg-slate-900 border-amber-950 text-slate-100';
              Icon = AlertTriangle;
              iconColor = 'text-amber-500';
            } else if (toast.type === 'error') {
              bg = 'bg-slate-900 border-rose-950 text-slate-100';
              Icon = XCircle;
              iconColor = 'text-rose-500';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                id={`toast-${toast.id}`}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${bg}`}
              >
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 text-sm font-medium">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
