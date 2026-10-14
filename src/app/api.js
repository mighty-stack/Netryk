import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearSession } from '../features/auth/authSlice';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const rawBase = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// Any 401 on a signed-in session ends it and wipes cached data so the next user never sees it.
const baseQuery = async (args, api, extra) => {
  const result = await rawBase(args, api, extra);
  if (result.error?.status === 401 && api.getState().auth.token && api.endpoint !== 'login') {
    api.dispatch(clearSession());
    api.dispatch(apiSlice.util.resetApiState());
  }
  return result;
};

const post = (url, body, method = 'POST') => ({ url, method, body });

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Shipment', 'Driver', 'User', 'Earning'],
  endpoints: (b) => ({
    login: b.mutation({ query: (body) => post('/auth/login', body) }),
    register: b.mutation({ query: (body) => post('/auth/register', body) }),
    getMe: b.query({ query: () => '/auth/me' }),
    updateMe: b.mutation({ query: (body) => post('/auth/me', body, 'PATCH') }),
    changePassword: b.mutation({ query: (body) => post('/auth/change-password', body) }),

    getQuote: b.query({ query: (body) => post('/shipments/quote', body) }),
    getTracking: b.query({ query: (id) => `/track/${encodeURIComponent(id)}` }),

    listShipments: b.query({ query: (params) => ({ url: '/shipments', params }), providesTags: ['Shipment'] }),
    getShipment: b.query({ query: (id) => `/shipments/${id}`, providesTags: (_r, _e, id) => [{ type: 'Shipment', id }] }),
    createShipment: b.mutation({ query: (body) => post('/shipments', body), invalidatesTags: ['Shipment'] }),
    payShipment: b.mutation({ query: (id) => post(`/shipments/${id}/pay`) }),
    cancelShipment: b.mutation({ query: ({ id, ...body }) => post(`/shipments/${id}/cancel`, body), invalidatesTags: ['Shipment'] }),
    driverStatus: b.mutation({ query: ({ id, ...body }) => post(`/shipments/${id}/status`, body, 'PATCH'), invalidatesTags: ['Shipment', 'Earning'] }),
    verifyPayment: b.query({ query: (ref) => `/payments/verify/${encodeURIComponent(ref)}`, providesTags: ['Shipment'] }),

    driverMe: b.query({ query: () => '/drivers/me' }),
    driverEarnings: b.query({ query: () => '/drivers/me/earnings', providesTags: ['Earning'] }),

    adminStats: b.query({ query: () => '/admin/stats', providesTags: ['Shipment'] }),
    adminUsers: b.query({ query: (params) => ({ url: '/admin/users', params }), providesTags: ['User'] }),
    adminUpdateUser: b.mutation({ query: ({ id, ...body }) => post(`/admin/users/${id}`, body, 'PATCH'), invalidatesTags: ['User', 'Driver'] }),
    adminDrivers: b.query({ query: () => '/admin/drivers', providesTags: ['Driver'] }),
    createDriver: b.mutation({ query: (body) => post('/admin/drivers', body), invalidatesTags: ['Driver', 'User'] }),
    updateDriver: b.mutation({ query: ({ id, ...body }) => post(`/admin/drivers/${id}`, body, 'PATCH'), invalidatesTags: ['Driver'] }),
    assignDriver: b.mutation({ query: ({ id, driverId }) => post(`/admin/shipments/${id}/assign`, { driverId }, 'PUT'), invalidatesTags: ['Shipment'] }),
    adminStatus: b.mutation({ query: ({ id, ...body }) => post(`/admin/shipments/${id}/status`, body, 'PATCH'), invalidatesTags: ['Shipment', 'Earning'] }),
    adminEarnings: b.query({ query: (params) => ({ url: '/admin/earnings', params }), providesTags: ['Earning'] }),
    markPaid: b.mutation({ query: (body) => post('/admin/earnings/mark-paid', body), invalidatesTags: ['Earning'] }),
  }),
});

export const {
  useLoginMutation, useRegisterMutation, useGetMeQuery, useUpdateMeMutation, useChangePasswordMutation,
  useGetQuoteQuery, useGetTrackingQuery, useListShipmentsQuery, useGetShipmentQuery, useCreateShipmentMutation,
  usePayShipmentMutation, useCancelShipmentMutation, useDriverStatusMutation, useVerifyPaymentQuery,
  useDriverMeQuery, useDriverEarningsQuery, useAdminStatsQuery, useAdminUsersQuery, useAdminUpdateUserMutation,
  useAdminDriversQuery, useCreateDriverMutation, useUpdateDriverMutation, useAssignDriverMutation,
  useAdminStatusMutation, useAdminEarningsQuery, useMarkPaidMutation,
} = apiSlice;
