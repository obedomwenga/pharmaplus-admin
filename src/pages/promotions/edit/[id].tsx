import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { formatDateForInput, getPromotionById, updatePromotion, formatFileSize } from '@/utils/helpers';
import { 
  PromotionFormData, 
  FileMetadata,
  Product,
  FormErrors, 
  AlertMessage 
} from '@/types/promotion';
import Link from 'next/link';

// Dummy product data - for simplicity, we'll use the same data defined in index.tsx
// In a real app, we'd fetch this from an API or context
const dummyProducts: Product[] = [
  { id: 1, productCode: "A0001", name: "Panadol Extra Strength" },
  { id: 2, productCode: "A0002", name: "Ibuprofen 400mg" },
  { id: 3, productCode: "A0003", name: "Aspirin 325mg" },
  { id: 4, productCode: "B0001", name: "Vitamin C 1000mg" },
  { id: 5, productCode: "B0002", name: "Multivitamin Daily" },
  { id: 6, productCode: "C0001", name: "Allergy Relief Tablets" },
  { id: 7, productCode: "C0002", name: "Cough Syrup" },
  { id: 8, productCode: "D0001", name: "Antibiotic Ointment" },
  { id: 9, productCode: "D0002", name: "Bandages Assorted" },
  { id: 10, productCode: "E0001", name: "Eye Drops" },
  { id: 11, productCode: "F0001", name: "Hand Sanitizer" },
  { id: 12, productCode: "F0002", name: "Face Masks 50pk" }
];

export default function EditPromotion() {
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const { register, handleSubmit, setValue, watch, formState: { errors: formValidationErrors } } = useForm<PromotionFormData>();
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [formFiles, setFormFiles] = useState<FileMetadata[]>([]);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [termsFile, setTermsFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  
  const applyTo = watch('apply_to');
  const discountType = watch('discount_type');
  
  // Load promotion data
  useEffect(() => {
    if (id) {
      const promotion = getPromotionById(id as string);
      
      if (promotion) {
        // Set form values
        setValue('id', promotion.id);
        setValue('name', promotion.name);
        setValue('description', promotion.description);
        setValue('promotion_type', promotion.promotion_type || 'PHARMAPLUS');
        setValue('partner_name', promotion.partner_name || '');
        setValue('discount_type', promotion.discount_type);
        setValue('discount_value', promotion.discount_value);
        setValue('apply_to', promotion.apply_to);
        setValue('target_identifiers', promotion.target_identifiers || []);
        setValue('bundledProductCodes', promotion.bundledProductCodes || []);
        setValue('min_cart_qty', promotion.min_cart_qty || 1);
        setValue('max_uses_per_user', promotion.max_uses_per_user || 100);
        setValue('total_uses_limit', promotion.total_uses_limit || 10000);
        setValue('start_datetime', promotion.start_datetime);
        setValue('end_datetime', promotion.end_datetime);
        setValue('is_active', promotion.is_active);
        setValue('terms_and_conditions', promotion.terms_and_conditions || '');
        setValue('rules', promotion.rules || '');
        
        // Handle files
        if (promotion.files && promotion.files.length > 0) {
          // Set the files metadata
          const filesMetadata = promotion.files.map(file => file as FileMetadata);
          setFormFiles(filesMetadata);
        }
        
        // Handle terms file
        if (promotion.terms_file) {
          setTermsFile(promotion.terms_file);
        }
        
        // Set selected products
        if (promotion.apply_to === 'PRODUCT' && promotion.target_identifiers && promotion.target_identifiers.length > 0) {
          // Get products by code
          const selected = products.filter(p => promotion.target_identifiers.includes(p.productCode));
          setSelectedProducts(selected);
        } else if (promotion.apply_to === 'BUNDLE' && promotion.bundledProductCodes && promotion.bundledProductCodes.length > 0) {
          const selected = products.filter(p => promotion.bundledProductCodes.includes(p.productCode));
          setSelectedProducts(selected);
        }
      } else {
        // Promotion not found - redirect to promotions page
        router.push('/promotions');
        return;
      }
      
      setLoading(false);
    }
  }, [id, products, setValue, router]);
  
  // Form validation
  const validateForm = (data: PromotionFormData): boolean => {
    const errors: FormErrors = {};
    
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.discount_value || data.discount_value <= 0) errors.discount_value = 'Discount must be greater than 0';
    
    if (data.apply_to === 'PRODUCT' && !data.target_identifiers.length) {
      errors.products = 'Please select at least one product';
    } else if (data.apply_to === 'BUNDLE' && !data.bundledProductCodes.length) {
      errors.products = 'Please select at least one product for the bundle';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit form
  const onSubmit = async (data: PromotionFormData) => {
    if (!validateForm(data)) {
      showAlert('Please fix the errors in the form.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a copy of data with file metadata
      const dataForStorage = {
        ...data,
        // Keep existing file metadata
        files: formFiles,
        // Keep terms file if it exists
        terms_file: termsFile || undefined
      };
      
      // Update promotion in localStorage
      updatePromotion(dataForStorage);
      
      // Simulating API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Promotion updated successfully!', 'success');
      
      // Redirect to promotion details page after short delay
      setTimeout(() => {
        router.push(`/promotions/${data.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating promotion:', error);
      showAlert('Failed to update promotion. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show alert message
  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };
  
  // Search products
  const searchProducts = () => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const search = productSearch.toLowerCase();
    
    // Filter products that match the search query and aren't already selected
    const selectedIds = selectedProducts.map(p => p.productCode);
    const results = products
      .filter(p => 
        (p.name.toLowerCase().includes(search) || 
        p.productCode.toLowerCase().includes(search)) && 
        !selectedIds.includes(p.productCode)
      )
      .slice(0, 10); // Limit to 10 results
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };
  
  // Add product to selection
  const addProduct = (product: Product) => {
    setSelectedProducts(prev => [...prev, product]);
    
    // Update form values based on promotion type
    if (applyTo === 'PRODUCT') {
      const newTargetIds = [...selectedProducts.map(p => p.productCode), product.productCode];
      setValue('target_identifiers', newTargetIds);
    } else {
      const newBundleCodes = [...selectedProducts.map(p => p.productCode), product.productCode];
      setValue('bundledProductCodes', newBundleCodes);
    }
    
    setProductSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
  };
  
  // Remove product from selection
  const removeProduct = (productCode: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productCode !== productCode));
    
    // Update form values based on promotion type
    if (applyTo === 'PRODUCT') {
      const newTargetIds = selectedProducts
        .filter(p => p.productCode !== productCode)
        .map(p => p.productCode);
      setValue('target_identifiers', newTargetIds);
    } else {
      const newBundleCodes = selectedProducts
        .filter(p => p.productCode !== productCode)
        .map(p => p.productCode);
      setValue('bundledProductCodes', newBundleCodes);
    }
  };
  
  // Remove file
  const removeFile = (index: number) => {
    setFormFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle terms file removal
  const removeTermsFile = () => {
    setTermsFile(null);
    setValue('terms_file', undefined);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      try {
        const newFiles = Array.from(event.target.files);
        
        // Simulate upload progress
        setFileUploading(true);
        setUploadProgress(0);
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            // Convert to file metadata for storage
            const newMetadata = newFiles.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type
            }));
            setFormFiles(prev => [...prev, ...newMetadata]);
            setFileUploading(false);
            event.target.value = '';
          }
        }, 200);
      } catch (error) {
        console.error("Error during file upload:", error);
        showAlert('Error uploading files. Please try again.', 'error');
        setFileUploading(false);
        event.target.value = '';
      }
    }
  };

  // Handle terms file upload
  const handleTermsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Create file metadata
      const fileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      setTermsFile(fileMetadata);
      
      // If it's a text file, we could read it, but here we'll just set it
      setValue('terms_file', fileMetadata);
      
      // Clear input value
      event.target.value = '';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pharma-green"></div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Edit Promotion | PharmaPlus Admin</title>
      </Head>
      <div className="bg-background-light rounded-lg shadow">
        {/* Header with branded style */}
        <div className="bg-pharma-green py-6 px-8 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Promotion</h1>
              <p className="text-green-100 mt-1 opacity-90">Update promotion details.</p>
            </div>
            <Link href={`/promotions/${id}`}>
              <span className="px-4 py-2 bg-white text-pharma-green rounded-md hover:bg-green-50">
                Cancel
              </span>
            </Link>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          {/* Alert Messages */}
          {alert && (
            <div className={`mb-6 p-4 rounded-md ${
              alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {alert.message}
            </div>
          )}
          
          {/* Edit Form - A simplified version of the create form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card">
              <h2 className="text-lg font-semibold text-text-primary mb-5">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary" htmlFor="promotion-name">Promotion Name</label>
                  <input
                    type="text"
                    id="promotion-name"
                    className={`mt-1 block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="Summer Sale"
                    {...register('name')}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary" htmlFor="promotion-description">Description</label>
                  <textarea
                    id="promotion-description"
                    rows={3}
                    className={`mt-1 block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm ${formErrors.description ? 'border-red-500' : ''}`}
                    placeholder="Details about the promotion"
                    {...register('description')}
                  ></textarea>
                  {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
                </div>
              </div>
              
              {/* Status toggle */}
              <div className="mb-6">
                <label htmlFor="is_active" className="block text-sm font-medium text-text-secondary">Status</label>
                <div className="flex items-center space-x-3 h-10 mt-1">
                  <span className="text-sm text-text-muted">Inactive</span>
                  <button 
                    type="button"
                    onClick={() => setValue('is_active', !watch('is_active'))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      watch('is_active') ? 'bg-pharma-green' : 'bg-pharma-gray-darker'
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        watch('is_active') ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-text-muted">Active</span>
                </div>
              </div>
              
              {/* Discount Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="discount_type" className="block text-sm font-medium text-text-secondary">Discount Type</label>
                  <select
                    id="discount_type"
                    {...register('discount_type')}
                    className="w-full p-2 border border-pharma-gray-darker rounded-md focus:ring-pharma-green focus:border-pharma-green bg-white"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="discount_value" className="block text-sm font-medium text-text-secondary">
                    Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '(Ksh)'}
                  </label>
                  <input
                    type="number"
                    id="discount_value"
                    {...register('discount_value')}
                    className={`w-full p-2 border rounded-md focus:ring-pharma-green focus:border-pharma-green transition-colors ${
                      formErrors.discount_value ? 'border-red-500' : 'border-pharma-gray-darker'
                    }`}
                  />
                  {formErrors.discount_value && <p className="text-red-500 text-xs">{formErrors.discount_value}</p>}
                </div>
              </div>
            </div>
            
            {/* Products Selection */}
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card">
              <h2 className="text-lg font-semibold text-text-primary mb-5">
                {applyTo === 'PRODUCT' ? 'Product Selection' : 'Bundle Creation'}
              </h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  {applyTo === 'PRODUCT' ? 'Select Products' : 'Create Bundle'}
                </label>
                <div className="border border-pharma-gray-darker rounded-md p-4 bg-white">
                  {selectedProducts.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium text-sm text-text-secondary">Selected Products</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map(product => (
                          <div 
                            key={product.productCode}
                            className="bg-pharma-gray border border-pharma-gray-dark rounded-full px-3 py-1 text-sm flex items-center"
                          >
                            <span className="text-text-secondary">{product.name}</span>
                            <button 
                              onClick={() => removeProduct(product.productCode)} 
                              className="ml-2 text-red-500 hover:text-red-700"
                              type="button"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-text-muted">No products selected</p>
                  )}
                  
                  {formErrors.products && <p className="text-red-500 text-xs mt-2">{formErrors.products}</p>}
                </div>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card">
              <h2 className="text-lg font-semibold text-text-primary mb-5">Terms and Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="terms">
                    Terms and Conditions Text
                  </label>
                  <textarea
                    id="terms"
                    rows={6}
                    className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm"
                    placeholder="Enter terms and conditions for this promotion"
                    {...register('terms_and_conditions')}
                  ></textarea>
                  <p className="mt-1 text-sm text-text-muted">
                    Specify any conditions, restrictions, or requirements that customers should know.
                  </p>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium text-text-secondary">Upload Terms Document (Optional)</div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-1">
                      <label htmlFor="terms-file" className="block w-full px-4 py-2 bg-pharma-gray-light border border-pharma-gray-dark rounded-md cursor-pointer hover:bg-pharma-gray transition-colors text-center text-sm">
                        <span className="text-text-secondary">Select Terms Document</span>
                        <input
                          type="file"
                          id="terms-file"
                          className="hidden"
                          accept=".txt,.pdf,.docx"
                          onChange={handleTermsFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                  {termsFile && (
                    <div className="mt-2 p-3 bg-pharma-gray-light rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pharma-green-dark mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-text-primary truncate">{termsFile.name}</p>
                          <p className="text-xs text-text-muted">{formatFileSize(termsFile.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={removeTermsFile}
                        className="ml-2 text-pharma-gray-darker hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="mt-3 text-sm text-text-muted">
                    Upload .txt, .pdf or .docx file (max 2MB).
                  </p>
                </div>
              </div>
            </div>
            
            {/* Promotion Rules */}
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-5">Promotion Rules</h2>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="rules">
                  Specific Rules for Redeeming
                </label>
                <textarea
                  id="rules"
                  rows={4}
                  className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm"
                  placeholder="Enter specific rules for redeeming this promotion"
                  {...register('rules')}
                ></textarea>
                <p className="mt-1 text-sm text-text-muted">
                  Explain any special procedures or steps customers need to follow to redeem this promotion.
                </p>
              </div>
            </div>

            {/* File uploads */}
            <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-5">Promotional Materials</h2>
              
              <div className="border-2 border-dashed border-pharma-gray-dark rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pharma-gray-dark mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-text-primary mb-1">Drag and drop files here</p>
                  <p className="text-xs text-text-muted mb-3">or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark focus:outline-none transition-colors"
                  >
                    Add Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                  />
                  <p className="text-xs text-text-muted mt-3">PNG, JPG, GIF, PDF up to 10MB</p>
                </div>
              </div>
              
              {/* Upload Progress */}
              {fileUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-text-secondary">Uploading...</p>
                    <p className="text-xs text-text-muted">{uploadProgress}%</p>
                  </div>
                  <div className="w-full bg-pharma-gray-dark rounded-full h-2">
                    <div 
                      className="bg-pharma-green h-2 rounded-full" 
                      style={{ width: `${uploadProgress}%` }} 
                    ></div>
                  </div>
                </div>
              )}
              
              {/* File Preview */}
              {formFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Uploaded Files ({formFiles.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formFiles.map((file, index) => (
                      <div key={index} className="group relative border border-pharma-gray rounded-md overflow-hidden shadow-sm">
                        <div className="h-36 bg-pharma-gray-light flex items-center justify-center">
                          {file.type && file.type.includes('image') ? (
                            <div className="w-full h-full bg-pharma-gray-light flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pharma-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pharma-green-dark mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="mt-2 text-sm font-medium text-pharma-green">{file.type && file.type.split('/')[1]?.toUpperCase() || 'File'}</p>
                            </div>
                          )}
                          <button 
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-3 border-t border-pharma-gray-dark bg-white">
                          <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                          <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <Link href={`/promotions/${id}`}>
                <span className="px-6 py-2 bg-white border border-pharma-gray-darker text-text-secondary rounded-md hover:bg-pharma-gray focus:outline-none shadow-sm transition-colors mr-4">
                  Cancel
                </span>
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark focus:outline-none disabled:opacity-50 shadow-sm transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Update Promotion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 