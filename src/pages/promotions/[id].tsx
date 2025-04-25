import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getPromotions, updatePromotion, formatFileSize } from '@/utils/helpers';
import { PromotionFormData, FileMetadata } from '@/types/promotion';

export default function PromotionDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [promotion, setPromotion] = useState<PromotionFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [daysActive, setDaysActive] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Load promotion data
  useEffect(() => {
    if (id) {
      loadPromotionData();
    }
  }, [id]);
  
  // Load promotion data function
  const loadPromotionData = () => {
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
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    loadPromotionData();
    
    // Show success message
    setAlertMessage({
      message: 'Promotion data refreshed successfully',
      type: 'success'
    });
  };
  
  // Toggle promotion status
  const toggleStatus = () => {
    if (!promotion) return;
    
    const updatedPromotion = {
      ...promotion,
      is_active: !promotion.is_active
    };
    
    updatePromotion(updatedPromotion);
    setPromotion(updatedPromotion);
    
    // Show success message
    setAlertMessage({
      message: `Promotion ${updatedPromotion.is_active ? 'activated' : 'deactivated'} successfully`,
      type: 'success'
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };
  
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
        <div className="bg-pharma-green py-4 md:py-6 px-4 md:px-8 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{promotion.name}</h1>
              <p className="text-green-100 mt-1 opacity-90">Promotion Details</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleRefresh}
                className="px-3 py-2 bg-white text-pharma-green rounded-md hover:bg-green-50 flex items-center shadow-sm transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <Link href={`/promotions/edit/${promotion.id}`}>
                <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 shadow-sm transition-colors flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </span>
              </Link>
              <Link href="/promotions">
                <span className="px-3 py-2 bg-white text-pharma-green rounded-md hover:bg-green-50 shadow-sm transition-colors flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6 lg:p-8">
          {/* Alert Message */}
          {alertMessage && (
            <div className={`mb-4 md:mb-6 p-4 rounded-md ${
              alertMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {alertMessage.message}
            </div>
          )}
          
          {/* Status & Controls */}
          <div className="bg-white p-4 md:p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  promotion.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {promotion.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  new Date(promotion.end_datetime) > new Date() 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {new Date(promotion.end_datetime) > new Date() ? 'Current' : 'Expired'}
                </span>
              </div>
              <button
                onClick={toggleStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  promotion.is_active 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } transition-colors text-sm`}
              >
                {promotion.is_active ? 'Deactivate Promotion' : 'Activate Promotion'}
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-text-secondary">Progress</div>
                <div className="text-sm font-medium text-text-primary">{progressPercentage}%</div>
              </div>
              <div className="w-full bg-pharma-gray rounded-full h-2.5">
                <div 
                  className="bg-pharma-green h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <div>{new Date(promotion.start_datetime).toLocaleDateString()}</div>
                <div>{new Date(promotion.end_datetime).toLocaleDateString()}</div>
              </div>
            </div>
            
            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-pharma-gray-light rounded-lg p-3">
                <div className="text-sm text-text-secondary">Time Remaining</div>
                <div className="text-lg font-semibold text-text-primary">{timeRemaining}</div>
              </div>
              <div className="bg-pharma-gray-light rounded-lg p-3">
                <div className="text-sm text-text-secondary">Days Active</div>
                <div className="text-lg font-semibold text-text-primary">{daysActive} days</div>
              </div>
              <div className="bg-pharma-gray-light rounded-lg p-3">
                <div className="text-sm text-text-secondary">Claimed</div>
                <div className="text-lg font-semibold text-text-primary">{promotion.claimed || 0}</div>
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
                <h3 className="text-sm font-medium text-text-secondary">Promotion Type</h3>
                <p className="mt-1 text-text-primary">
                  {promotion.promotion_type === 'PHARMAPLUS' ? 'PharmaPlus Promotion' : 'Partner Promotion'}
                  {promotion.promotion_type === 'PARTNER' && promotion.partner_name && (
                    <span className="ml-2 text-pharma-blue">
                      (Partner: {promotion.partner_name})
                    </span>
                  )}
                </p>
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
          
          {/* Applied Products */}
          <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Applied Products</h2>
            
            <div className="mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Type</h3>
              <p className="mt-1 text-text-primary">
                {promotion.apply_to === 'PRODUCT' ? 'Individual Products' : 'Product Bundle'}
              </p>
            </div>
            
            {/* Display product codes */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Product Codes</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {promotion.apply_to === 'PRODUCT' ? (
                  promotion.target_identifiers.map((id, index) => (
                    <span key={index} className="bg-pharma-gray-light px-3 py-1 rounded-md text-sm">
                      {id}
                    </span>
                  ))
                ) : (
                  promotion.bundledProductCodes.map((id, index) => (
                    <span key={index} className="bg-pharma-gray-light px-3 py-1 rounded-md text-sm">
                      {id}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          {promotion.terms_and_conditions && (
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Terms and Conditions</h2>
              <p className="text-text-secondary whitespace-pre-line">{promotion.terms_and_conditions}</p>
            </div>
          )}
          
          {/* Promotion Rules */}
          {promotion.rules && (
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Promotion Rules</h2>
              <p className="text-text-secondary whitespace-pre-line">{promotion.rules}</p>
            </div>
          )}
          
          {/* Promotional Materials */}
          {promotion.files && promotion.files.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Promotional Materials</h2>
              
              {/* Image Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotion.files.map((file, index) => {
                  const fileData = file as FileMetadata;
                  // Check if type exists before using includes
                  const isImage = fileData.type ? fileData.type.includes('image') : false;
                  
                  return (
                    <div key={index} className="border border-pharma-gray-dark rounded-lg overflow-hidden shadow-sm">
                      {isImage ? (
                        <div className="aspect-w-16 aspect-h-9 bg-white">
                          <div className="flex items-center justify-center h-48 bg-gray-50">
                            {/* In a real app with backend storage, we would use the file URL */}
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pharma-gray-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80">
                                <div className="text-center px-4">
                                  <div className="w-full h-32 bg-pharma-gray-light rounded-md flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pharma-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-pharma-gray-light p-4">
                          <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pharma-green-dark mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-sm font-medium text-pharma-green">Document</p>
                            <p className="text-xs text-text-muted">
                              {fileData.type && fileData.type.split('/')[1]?.toUpperCase() || 'File'}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="p-3 border-t border-pharma-gray-dark bg-white">
                        <p className="text-sm font-medium text-text-primary truncate">{fileData.name}</p>
                        <p className="text-xs text-text-muted">{formatFileSize(fileData.size || 0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 py-4 px-6 bg-pharma-gray-light rounded-lg">
                <p className="text-sm text-pharma-gray-darker">
                  <span className="font-medium">Note:</span> In a production environment with server storage, actual images would be displayed here.
                  For the demo version, we're showing placeholders for the uploaded files.
                </p>
              </div>
              
              {/* Terms File Display (if any) */}
              {promotion.terms_file && (
                <div className="mt-8">
                  <h3 className="font-medium text-text-primary mb-2">Terms & Conditions Document</h3>
                  <div className="flex items-center p-3 border border-pharma-gray-dark rounded-md bg-pharma-gray-light">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pharma-green-dark mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">{promotion.terms_file.name}</p>
                      <p className="text-xs text-text-muted">{formatFileSize(promotion.terms_file.size)}</p>
                  </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 