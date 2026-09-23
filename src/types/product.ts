export interface ProductImage {
  id?: number;
  url: string;
}

export interface ProductReview {
  // DummyJSON reviews currently have no id field; present only if the API
  // (or a future version) provides one, in which case it is preferred as key.
  id?: number;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryResponse {
  slug: string;
  name: string;
  url: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
}

export interface ProductFormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
  rating?: string;
}

export type SortField = 'price' | 'rating' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  page: number;
  pageSize: number;
  search: string;
  category: string;
  sort: `${SortField}-${SortOrder}` | '';
}