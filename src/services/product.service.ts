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
  }): Promise<ProductsResponse> {
    const { limit, skip, search, category, sortBy, order } = params;
    
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
    
    const response = await axiosInstance.get<ProductsResponse>(`${url}?${queryParams.toString()}`);
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await axiosInstance.get<string[]>('/products/categories');
    return response.data;
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