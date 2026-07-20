/**
 * Database Entity Definitions
 */

export interface Service {
  id: string;
  client_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
  active: boolean;
}

export interface Staff {
  id: string;
  client_id: string;
  name: string;
  bio: string;
  photo_url: string;
  active: boolean;
}

export interface Product {
  id: string;
  client_id: string;
  name: string;
  description: string;
  price: number;
  photo_url: string;
  stock_qty: number;
  is_hidden: boolean;
}

export interface Booking {
  id: string;
  client_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: string;
  staff_id: string | null;
  start_time: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  services?: Service; // Relational join
  staff?: Staff;      // Relational join
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  price: number;
  products?: Product; // Relational join
}

export interface Order {
  id: string;
  client_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Invoice {
  id: string;
  client_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'sent';
  created_at: string;
  description?: string;
  due_date?: string;
}

export interface Submission {
  id: string;
  client_id: string;
  form_name: string;
  customer_name: string;
  customer_email: string;
  message: string;
  created_at: string;
}

/**
 * API Request Payload Definitions
 */

export interface BookingPayload {
  clientId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  serviceId: string;
  staffId?: string; // Optional UUID
  startTime: string; // ISO 8601
}

export interface OrderPayload {
  clientId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    qty: number;
  }>;
  notes: string;
}

export interface InquiryPayload {
  clientId: string;
  formName: string;
  customer: {
    name: string;
    email: string;
  };
  fields: {
    message: string;
  };
  website: string; // honeypot
}

export interface InvoicePayload {
  clientId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  description: string;
}
