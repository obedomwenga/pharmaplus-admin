export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type ApplyToType = 'PRODUCT' | 'BUNDLE';

export interface Product {
  id: number;
  productCode: string;
  name: string;
}

export interface FormErrors {
  name?: string;
  description?: string;
  discount_value?: string;
  products?: string;
  start_datetime?: string;
  end_datetime?: string;
}

export interface AlertMessage {
  message: string;
  type: 'success' | 'error';
}

export interface PromotionFormData {
  id?: string;
  name: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  apply_to: ApplyToType;
  target_identifiers: string[];
  bundledProductCodes: string[];
  min_cart_qty: number;
  max_uses_per_user: number;
  total_uses_limit: number;
  start_datetime: string;
  end_datetime: string;
  is_active: boolean;
  files: File[];
  createdAt?: string;
  claimed?: number;
} 