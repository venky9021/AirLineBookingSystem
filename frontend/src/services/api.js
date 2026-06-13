const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errData = await response.json();
      errorMessage = errData.message || errorMessage;
    } catch (e) {
      // Failed to parse error JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Authentication
  register: async (name, email, password, phone) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  // Flights
  searchFlights: async (origin, destination, date) => {
    const queryParams = new URLSearchParams();
    if (origin) queryParams.append('origin', origin);
    if (destination) queryParams.append('destination', destination);
    if (date) queryParams.append('date', date);

    const res = await fetch(`${API_BASE_URL}/flights/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getFlight: async (id) => {
    const res = await fetch(`${API_BASE_URL}/flights/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Bookings
  createBooking: async (flightId, travelClass, passengers) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ flightId, travelClass, passengers }),
    });
    return handleResponse(res);
  },

  getMyBookings: async () => {
    const res = await fetch(`${API_BASE_URL}/bookings/my`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getBooking: async (pnr) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${pnr}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  cancelBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Payments
  confirmPayment: async (bookingId, method, gatewayTxnId, amount) => {
    const res = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId, method, gatewayTxnId, amount }),
    });
    return handleResponse(res);
  },

  // Check-In
  checkIn: async (pnr, lastName) => {
    const res = await fetch(`${API_BASE_URL}/checkin/${pnr}?lastName=${encodeURIComponent(lastName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  // Admin
  getAdminFlights: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/flights`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createAdminFlight: async (flightData) => {
    const res = await fetch(`${API_BASE_URL}/admin/flights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(flightData),
    });
    return handleResponse(res);
  },

  updateAdminFlight: async (id, flightData) => {
    const res = await fetch(`${API_BASE_URL}/admin/flights/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(flightData),
    });
    return handleResponse(res);
  },

  cancelAdminFlight: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/flights/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
