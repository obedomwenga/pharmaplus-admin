import { format, addDays } from 'date-fns';
import { PromotionFormData } from '@/types/promotion';

// Format date for input fields
export function formatDateForInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

// Add days to a date
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

// Format file size for display
export function formatFileSize(size: number): string {
  if (size < 1024) return size + ' bytes';
  else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  else return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

// Get all promotions from localStorage
export function getPromotions(): PromotionFormData[] {
  const promotionsJson = localStorage.getItem('pharmaplus_promotions');
  return promotionsJson ? JSON.parse(promotionsJson) : [];
}

// Save a new promotion to localStorage
export function savePromotion(promotion: PromotionFormData): void {
  const promotions = getPromotions();
  // Add unique ID to the promotion
  const promotionWithId = {
    ...promotion,
    id: Date.now().toString(), // Use timestamp as a simple ID
    createdAt: new Date().toISOString()
  };
  promotions.push(promotionWithId);
  localStorage.setItem('pharmaplus_promotions', JSON.stringify(promotions));
}

// Delete a promotion from localStorage
export function deletePromotion(id: string): void {
  const promotions = getPromotions();
  const updatedPromotions = promotions.filter(p => p.id !== id);
  localStorage.setItem('pharmaplus_promotions', JSON.stringify(updatedPromotions));
} 