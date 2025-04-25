export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type ApplyToType = 'PRODUCT' | 'BUNDLE';
export type PromotionType = 'PHARMAPLUS' | 'PARTNER';

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

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export interface PromotionFormData {
  id?: string;
  name: string;
  description: string;
  promotion_type: PromotionType;
  partner_name?: string;
  partner_logo?: File | FileMetadata;
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
  files: (File | FileMetadata)[];
  terms_and_conditions?: string;
  terms_file?: FileMetadata;
  rules?: string;
  createdAt?: string;
  claimed?: number;
} 