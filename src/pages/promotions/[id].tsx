import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getPromotions } from '@/utils/helpers';
import { PromotionFormData } from '@/types/promotion';

export default function PromotionDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [promotion, setPromotion] = useState<PromotionFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [daysActive, setDaysActive] = useState<number>(0);
  
  // Load promotion data
  useEffect(() => {
    if (id) {
      const promotions = getPromotions();
      const foundPromotion = promotions.find(p => p.id === id);
      
      if (foundPromotion) {
        setPromotion(foundPromotion);
        
        // Calculate days active
        const startDate = new Date(foundPromotion.start_datetime);
        const now = new Date();
        const differenceInTime = now.getTime() - startDate.getTime();
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        setDaysActive(differenceInDays > 0 ? differenceInDays : 0);
        
        // Random number of claimed promotions (for demo)
        const claimed = Math.floor(Math.random() * 50);
        foundPromotion.claimed = claimed;
      }
      setLoading(false);
    }
  }, [id]);
  
  // Update time remaining
  useEffect(() => {
    if (!promotion) return;
    
    const updateTimeRemaining = () => {
      const now = new Date();
      const endDate = new Date(promotion.end_datetime);
      
      // If promotion has ended
      if (now > endDate) {
        setTimeRemaining('Expired');
        return;
      }
      
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${diffDays}d ${diffHours}h ${diffMinutes}m`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [promotion]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pharma-green"></div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Promotion Not Found</h2>
          <p className="text-text-secondary mb-6">The promotion you're looking for doesn't exist or has been removed.</p>
          <Link href="/promotions">
            <span className="px-4 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark">
              Back to Promotions
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    const start = new Date(promotion.start_datetime).getTime();
    const end = new Date(promotion.end_datetime).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const progressPercentage = calculateProgress();

  return (
    <>
      <Head>
        <title>{promotion.name} | PharmaPlus Admin</title>
      </Head>
      <div className="bg-background-light rounded-lg shadow">
        {/* Header with branded style */}
        <div className="bg-pharma-green py-6 px-8 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{promotion.name}</h1>
              <p className="text-green-100 mt-1 opacity-90">Promotion Details</p>
            </div>
            <Link href="/promotions">
              <span className="px-4 py-2 bg-white text-pharma-green rounded-md hover:bg-green-50">
                Back to Promotions
              </span>
            </Link>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">Status Overview</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                promotion.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {promotion.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Time remaining */}
              <div className="bg-pharma-gray-light p-4 rounded-md">
                <h3 className="text-sm font-medium text-text-secondary mb-1">Time Remaining</h3>
                <p className="text-xl font-bold text-text-primary">{timeRemaining}</p>
                <div className="mt-2 w-full bg-pharma-gray-dark rounded-full h-2.5">
                  <div 
                    className="bg-pharma-green h-2.5 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-text-muted">
                  <span>{new Date(promotion.start_datetime).toLocaleDateString()}</span>
                  <span>{new Date(promotion.end_datetime).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Days active */}
              <div className="bg-pharma-gray-light p-4 rounded-md">
                <h3 className="text-sm font-medium text-text-secondary mb-1">Days Active</h3>
                <p className="text-xl font-bold text-text-primary">{daysActive} days</p>
                <p className="text-sm text-text-muted mt-1">
                  Started on {new Date(promotion.start_datetime).toLocaleDateString()}
                </p>
              </div>
              
              {/* Usage stats */}
              <div className="bg-pharma-gray-light p-4 rounded-md">
                <h3 className="text-sm font-medium text-text-secondary mb-1">Usage</h3>
                <p className="text-xl font-bold text-text-primary">{promotion.claimed || 0} / {promotion.total_uses_limit}</p>
                <p className="text-sm text-text-muted mt-1">
                  {promotion.max_uses_per_user} uses per customer allowed
                </p>
              </div>
            </div>
          </div>
          
          {/* Promotion Details */}
          <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Promotion Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Description</h3>
                <p className="mt-1 text-text-primary">{promotion.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Discount</h3>
                <p className="mt-1 text-text-primary">
                  {promotion.discount_value}{promotion.discount_type === 'PERCENTAGE' ? '%' : ' KSH'} {promotion.discount_type === 'PERCENTAGE' ? 'off' : 'discount'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Type</h3>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    promotion.apply_to === 'PRODUCT' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {promotion.apply_to}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Min Cart Quantity</h3>
                <p className="mt-1 text-text-primary">{promotion.min_cart_qty} item(s)</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-text-secondary">Applicable Products</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {promotion.apply_to === 'PRODUCT' && promotion.target_identifiers && promotion.target_identifiers.map(code => (
                    <div 
                      key={code}
                      className="bg-pharma-gray border border-pharma-gray-dark rounded-full px-3 py-1 text-sm"
                    >
                      <span className="text-text-secondary">{code}</span>
                    </div>
                  ))}
                  
                  {promotion.apply_to === 'BUNDLE' && promotion.bundledProductCodes && promotion.bundledProductCodes.map(code => (
                    <div 
                      key={code}
                      className="bg-pharma-gray border border-pharma-gray-dark rounded-full px-3 py-1 text-sm"
                    >
                      <span className="text-text-secondary">{code}</span>
                    </div>
                  ))}
                  
                  {((promotion.apply_to === 'PRODUCT' && (!promotion.target_identifiers || promotion.target_identifiers.length === 0)) ||
                    (promotion.apply_to === 'BUNDLE' && (!promotion.bundledProductCodes || promotion.bundledProductCodes.length === 0))) && (
                    <p className="text-text-muted">No products specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Promotional Materials */}
          {promotion.files && promotion.files.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Promotional Materials</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* This is a placeholder since we can't actually display the files */}
                <div className="border border-pharma-gray-dark rounded-md p-4 flex items-center space-x-3">
                  <div className="text-pharma-gray-darker">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Promotional File</p>
                    <p className="text-xs text-text-muted">File would be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 