import axiosInstance from '@/lib/axios';
import type { Product, ProductsResponse, CategoryResponse, ProductFormData } from '@/types/product';

export const productService = {
  async getProducts(params: {
    limit: number;
    skip: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    signal?: AbortSignal;
  }): Promise<ProductsResponse> {
    const { limit, skip, search, category, sortBy, order, signal } = params;

    // DummyJSON has separate endpoints for search and category.
    // Search wins when both are present; the list page disables
    // the category dropdown while searching (see README).
    let url = '/products';
    const queryParams = new URLSearchParams();

    queryParams.append('limit', limit.toString());
    queryParams.append('skip', skip.toString());

    if (search) {
      url = '/products/search';
      queryParams.append('q', search);
    } else if (category) {
      url = `/products/category/${category}`;
    }

    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }
    if (order) {
      queryParams.append('order', order);
    }

    const response = await axiosInstance.get<ProductsResponse>(`${url}?${queryParams.toString()}`, {
      signal,
    });
    return response.data;
  },

  async getProductById(id: number, signal?: AbortSignal): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/products/${id}`, { signal });
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    // DummyJSON returns string[] in older docs and {slug,name,url}[]
    // in newer responses. Normalize to string[] (slugs) for the UI.
    const response = await axiosInstance.get<string[] | CategoryResponse[]>('/products/categories');
    const data = response.data;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      return (data as CategoryResponse[]).map((c) => c.slug);
    }
    return data as string[];
  },

  async addProduct(product: ProductFormData): Promise<Product> {
    const response = await axiosInstance.post<Product>('/products/add', product);
    return response.data;
  },

  async updateProduct(id: number, product: Partial<ProductFormData>): Promise<Product> {
    const response = await axiosInstance.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
    const response = await axiosInstance.delete<{ id: number; isDeleted: boolean; deletedOn: string }>(`/products/${id}`);
    return response.data;
  },
};