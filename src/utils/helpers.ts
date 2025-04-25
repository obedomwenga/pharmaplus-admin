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
export function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes < 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get all promotions from localStorage
export function getPromotions(): PromotionFormData[] {
  const promotionsJson = localStorage.getItem('pharmaplus_promotions');
  
  if (promotionsJson) {
    const promotions = JSON.parse(promotionsJson);
    // Check if promotions need migration to new format
    let needsMigration = false;
    for (const promotion of promotions) {
      if (!promotion.files || !Array.isArray(promotion.files) || 
          promotion.terms_and_conditions === undefined ||
          promotion.rules === undefined) {
        needsMigration = true;
        break;
      }
    }
    
    if (needsMigration) {
      const migratedPromotions = migratePromotions(promotions);
      localStorage.setItem('pharmaplus_promotions', JSON.stringify(migratedPromotions));
      return migratedPromotions;
    }
    
    return promotions;
  }
  
  return [];
}

// Migrate promotions to new data structure
export function migratePromotions(promotions: PromotionFormData[]): PromotionFormData[] {
  return promotions.map(promotion => {
    const migratedPromotion = { ...promotion };
    
    // Ensure files array exists
    if (!migratedPromotion.files || !Array.isArray(migratedPromotion.files)) {
      migratedPromotion.files = [];
    }
    
    // Ensure terms_and_conditions exists
    if (migratedPromotion.terms_and_conditions === undefined) {
      migratedPromotion.terms_and_conditions = '';
    }
    
    // Ensure rules exists
    if (migratedPromotion.rules === undefined) {
      migratedPromotion.rules = '';
    }
    
    // Ensure partner_name exists for PARTNER type
    if (migratedPromotion.promotion_type === 'PARTNER' && !migratedPromotion.partner_name) {
      migratedPromotion.partner_name = '';
    }
    
    // Ensure min_cart_qty exists
    if (migratedPromotion.min_cart_qty === undefined) {
      migratedPromotion.min_cart_qty = 1;
    }
    
    // Ensure max_uses_per_user exists
    if (migratedPromotion.max_uses_per_user === undefined) {
      migratedPromotion.max_uses_per_user = 100;
    }
    
    // Ensure total_uses_limit exists
    if (migratedPromotion.total_uses_limit === undefined) {
      migratedPromotion.total_uses_limit = 10000;
    }
    
    // Ensure bundledProductCodes exists for BUNDLE type
    if (migratedPromotion.apply_to === 'BUNDLE' && (!migratedPromotion.bundledProductCodes || !Array.isArray(migratedPromotion.bundledProductCodes))) {
      migratedPromotion.bundledProductCodes = [];
      // If there are target_identifiers, move them to bundledProductCodes
      if (migratedPromotion.target_identifiers && migratedPromotion.target_identifiers.length > 0) {
        migratedPromotion.bundledProductCodes = [...migratedPromotion.target_identifiers];
      }
    }
    
    return migratedPromotion;
  });
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

// Get a single promotion by ID
export function getPromotionById(id: string): PromotionFormData | null {
  const promotions = getPromotions();
  const promotion = promotions.find(p => p.id === id);
  return promotion || null;
}

// Update an existing promotion
export function updatePromotion(updatedPromotion: PromotionFormData): void {
  const promotions = getPromotions();
  const index = promotions.findIndex(p => p.id === updatedPromotion.id);
  
  if (index !== -1) {
    promotions[index] = {
      ...updatedPromotion,
      // Preserve creation date
      createdAt: promotions[index].createdAt
    };
    localStorage.setItem('pharmaplus_promotions', JSON.stringify(promotions));
  }
} 