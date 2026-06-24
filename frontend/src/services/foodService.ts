import { api } from './api';
import { DashboardStats, Order, Product, User } from '../types';

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  return data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
  return data;
}

export async function fetchProducts() {
  const { data } = await api.get<{ products: Product[] }>('/products');
  return data.products;
}

export async function fetchAllProducts() {
  const { data } = await api.get<{ products: Product[] }>('/products/admin/all');
  return data.products;
}

export async function createProduct(payload: Partial<Product>) {
  const { data } = await api.post<{ product: Product }>('/products', payload);
  return data.product;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await api.put<{ product: Product }>(`/products/${id}`, payload);
  return data.product;
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`);
}

export async function createOrder(payload: {
  items: { productId: string; quantity: number }[];
  paymentMethod: 'online' | 'cod';
  deliveryAddress: string;
  notes?: string;
}) {
  const { data } = await api.post<{ order: Order; clientSecret?: string }>('/orders', payload);
  return data;
}

export async function confirmPayment(orderId: string) {
  const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/confirm-payment`);
  return data.order;
}

export async function fetchMyOrders() {
  const { data } = await api.get<{ orders: Order[] }>('/orders/mine');
  return data.orders;
}

export async function fetchOrder(id: string) {
  const { data } = await api.get<{ order: Order }>(`/orders/${id}`);
  return data.order;
}

export async function fetchAllOrders() {
  const { data } = await api.get<{ orders: Order[] }>('/orders/admin/all');
  return data.orders;
}

export async function updateOrderStatus(id: string, status: string) {
  const { data } = await api.patch<{ order: Order }>(`/orders/${id}/status`, { status });
  return data.order;
}

export async function fetchDashboardStats() {
  const { data } = await api.get<{ stats: DashboardStats }>('/orders/admin/stats');
  return data.stats;
}
