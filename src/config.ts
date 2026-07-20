import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const ENV = {
  API_BASE_URL: (import.meta as any).env.VITE_API_BASE_URL || '',
  SUPABASE_URL: (import.meta as any).env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '',
  CLIENT_ID: (import.meta as any).env.VITE_CLIENT_ID || 'placeholder-tenant-id',
};

// Check if credentials are present
const hasSupabaseCreds = !!ENV.SUPABASE_URL && !!ENV.SUPABASE_ANON_KEY;

// Log warnings if credentials are missing
if (!hasSupabaseCreds) {
  console.warn(
    'Supabase configuration is missing. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.'
  );
}

// Graceful Supabase initialization to avoid crashing on start
export const supabase: SupabaseClient = createClient(
  ENV.SUPABASE_URL || 'https://placeholder-url.supabase.co',
  ENV.SUPABASE_ANON_KEY || 'placeholder-key'
);

/**
 * Global API Client with centralized error handling and response intercepting
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${ENV.API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject current auth token if available in local session
  const sessionStr = localStorage.getItem(`sb-${ENV.CLIENT_ID}-auth-token`) || 
                     localStorage.getItem('supabase.auth.token'); // typical standard fallbacks
  if (sessionStr) {
    try {
      const parsed = JSON.parse(sessionStr);
      const token = parsed?.currentSession?.access_token || parsed?.access_token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (e) {
      // Ignored
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const status = response.status;
    let errorMessage = `HTTP error! status: ${status}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson?.message || errorJson?.error || errorMessage;
    } catch (_) {
      // Ignore text parse errors
    }

    // Centered Global Error Interceptor behavior
    switch (status) {
      case 400:
        // Inline form validation error indicator (returns error body to component)
        throw { status, message: errorMessage, type: 'VALIDATION_ERROR' };
      case 401:
      case 403:
        // Clear tokens and redirect
        localStorage.removeItem(`sb-${ENV.CLIENT_ID}-auth-token`);
        // We can dispatch an event to handle login redirection in the SPA router
        window.dispatchEvent(new Event('auth_required'));
        throw { status, message: 'Authentication expired or invalid. Please log in again.', type: 'AUTH_ERROR' };
      case 404:
        throw { status, message: 'The requested resource was not found.', type: 'NOT_FOUND_ERROR' };
      case 409:
        // Booking conflict or inventory change detected
        window.dispatchEvent(new CustomEvent('app_toast', {
          detail: { message: 'Booking conflict or inventory change detected. Refreshing data...', type: 'warning' }
        }));
        throw { status, message: 'Conflict detected.', type: 'CONFLICT_ERROR' };
      case 429:
        // Too many requests
        window.dispatchEvent(new CustomEvent('app_banner', {
          detail: { message: 'Too many requests. Please wait a moment and try again.', type: 'rate_limit' }
        }));
        throw { status, message: 'Too many requests.', type: 'RATE_LIMIT_ERROR' };
      case 500:
      default:
        window.dispatchEvent(new CustomEvent('app_toast', {
          detail: { message: 'Server error. Our team has been notified.', type: 'error' }
        }));
        throw { status, message: 'Internal server error.', type: 'SERVER_ERROR' };
    }
  }

  // Handle successful empty response (e.g., 204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
