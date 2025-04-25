import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Alert from '@/components/ui/Alert';
import { formatDateForInput, addDaysToDate, formatFileSize, getPromotions, savePromotion, deletePromotion } from '@/utils/helpers';
import { 
  PromotionFormData, 
  DiscountType, 
  ApplyToType, 
  Product, 
  FormErrors, 
  AlertMessage 
} from '@/types/promotion';

// Dummy product data
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

export default function PromotionsPage() {
  // Active tab state
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form state using react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors: formValidationErrors } } = useForm<PromotionFormData>({
    defaultValues: {
      name: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      apply_to: 'PRODUCT',
      target_identifiers: [],
      bundledProductCodes: [],
      min_cart_qty: 1,
      max_uses_per_user: 100,
      total_uses_limit: 10000,
      start_datetime: formatDateForInput(new Date()),
      end_datetime: formatDateForInput(addDaysToDate(new Date(), 30)),
      is_active: true,
      files: []
    }
  });

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
  const [formFiles, setFormFiles] = useState<File[]>([]);
  
  const applyTo = watch('apply_to');
  const discountType = watch('discount_type');
  
  // Promotions list state
  const [promotions, setPromotions] = useState<PromotionFormData[]>([]);
  
  // Load promotions from localStorage
  const loadPromotions = () => {
    const storedPromotions = getPromotions();
    setPromotions(storedPromotions);
  };
  
  // Delete promotion
  const handleDeletePromotion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      deletePromotion(id);
      loadPromotions(); // Reload the list
      showAlert('Promotion deleted successfully', 'success');
    }
  };

  // Fetch products and promotions when component mounts
  useEffect(() => {
    try {
      // Set products from dummy data
      setProducts(dummyProducts);
      
      // Load promotions from localStorage
      loadPromotions();
      
      // Optional: Show a success message
      showAlert('Products loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading products:', error);
      showAlert('Failed to load products. Using demo data.', 'error');
    }
  }, []);

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

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFormFiles(prev => [...prev, ...newFiles]);
      event.target.value = '';
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFormFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Show alert message
  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

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
    
    // Validate dates
    const start = new Date(data.start_datetime);
    const end = new Date(data.end_datetime);
    const now = new Date();
    
    if (start < now) errors.start_datetime = 'Start date must be in the future';
    if (end <= start) errors.end_datetime = 'End date must be after start date';
    
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
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'files') {
          // Handle files separately
          formFiles.forEach(file => {
            formData.append('files', file);
          });
        } else if (key === 'target_identifiers' || key === 'bundledProductCodes') {
          // Only include the relevant field based on promotion type
          if ((key === 'target_identifiers' && data.apply_to === 'PRODUCT') || 
              (key === 'bundledProductCodes' && data.apply_to === 'BUNDLE')) {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          formData.append(key, String(value));
        }
      });
      
      // Instead of sending to API, just log the form data and save to localStorage
      console.log('Form would be submitted with these values:', data);
      
      // Save promotion to localStorage
      savePromotion(data);
      
      // Reload promotions list
      loadPromotions();
      
      // Simulating API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Promotion created successfully! (Demo Mode)', 'success');
      
      // Reset form after successful submission
      resetForm();
      
      // Switch to list tab to show the newly created promotion
      setActiveTab('list');
      
    } catch (error) {
      console.error('Error creating promotion:', error);
      showAlert('Failed to create promotion. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    // Reset form values
    setValue('name', '');
    setValue('description', '');
    setValue('discount_type', 'PERCENTAGE');
    setValue('discount_value', 0);
    setValue('apply_to', 'PRODUCT');
    setValue('target_identifiers', []);
    setValue('bundledProductCodes', []);
    setValue('min_cart_qty', 1);
    setValue('max_uses_per_user', 100);
    setValue('total_uses_limit', 10000);
    setValue('start_datetime', formatDateForInput(new Date()));
    setValue('end_datetime', formatDateForInput(addDaysToDate(new Date(), 30)));
    setValue('is_active', true);
    
    // Reset other state
    setSelectedProducts([]);
    setFormFiles([]);
  };

  // Reset selected products when switching promotion type
  useEffect(() => {
    setSelectedProducts([]);
    setValue('target_identifiers', []);
    setValue('bundledProductCodes', []);
  }, [applyTo, setValue]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSearchResults) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSearchResults]);
  
  // Render
  return (
    <>
      <Head>
        <title>Promotions | PharmaPlus Admin</title>
      </Head>
      <div className="bg-background-light rounded-lg shadow">
        {/* Header with branded style */}
        <div className="bg-pharma-green py-6 px-8 rounded-t-lg">
          <h1 className="text-2xl font-bold text-white">Promotions Management</h1>
          <p className="text-green-100 mt-1 opacity-90">Create and manage time-based promotions for products or bundles.</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b border-pharma-gray-dark">
          <div className="px-8 flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'create'
                  ? 'border-pharma-green text-pharma-green'
                  : 'border-transparent text-text-secondary hover:text-pharma-green hover:border-pharma-green-light'
              }`}
            >
              Create Promotion
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-pharma-green text-pharma-green'
                  : 'border-transparent text-text-secondary hover:text-pharma-green hover:border-pharma-green-light'
              }`}
            >
              View Promotions
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === 'create' ? (
            <>
              {/* Promotion Type Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-secondary mb-2">Promotion Type</label>
                <div className="flex bg-pharma-gray rounded-lg p-1 w-64 shadow-sm">
                  <button 
                    onClick={() => setValue('apply_to', 'PRODUCT')} 
                    className={`flex-1 px-4 py-2 text-center rounded-md transition-colors font-medium ${
                      applyTo === 'PRODUCT' 
                        ? 'bg-pharma-green text-white shadow-sm' 
                        : 'text-text-secondary hover:bg-pharma-gray-dark'
                    }`}
                    type="button"
                  >
                    PRODUCT
                  </button>
                  <button 
                    onClick={() => setValue('apply_to', 'BUNDLE')} 
                    className={`flex-1 px-4 py-2 text-center rounded-md transition-colors font-medium ${
                      applyTo === 'BUNDLE' 
                        ? 'bg-pharma-green text-white shadow-sm' 
                        : 'text-text-secondary hover:bg-pharma-gray-dark'
                    }`}
                    type="button"
                  >
                    BUNDLE
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-background-light p-6 rounded-lg border border-pharma-gray-dark shadow-card">
                  <h2 className="text-lg font-semibold text-text-primary mb-5">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Promotion Name</label>
                      <input
                        type="text"
                        id="name"
                        {...register('name', { required: true })}
                        className={`w-full p-2 border rounded-md focus:ring-pharma-green focus:border-pharma-green transition-colors ${
                          formErrors.name ? 'border-state-error ring-1 ring-state-error' : 'border-pharma-gray-darker'
                        }`}
                      />
                      {formErrors.name && <p className="text-state-error text-xs">{formErrors.name}</p>}
                    </div>

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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label htmlFor="discount_value" className="block text-sm font-medium text-text-secondary">
                        Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '(Ksh)'}
                      </label>
                      <input
                        type="number"
                        id="discount_value"
                        {...register('discount_value', { 
                          required: true,
                          min: 0,
                          max: discountType === 'PERCENTAGE' ? 100 : undefined
                        })}
                        className={`w-full p-2 border rounded-md focus:ring-pharma-green focus:border-pharma-green transition-colors ${
                          formErrors.discount_value ? 'border-state-error ring-1 ring-state-error' : 'border-pharma-gray-darker'
                        }`}
                      />
                      {formErrors.discount_value && <p className="text-state-error text-xs">{formErrors.discount_value}</p>}
                    </div>

                    <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                    <textarea
                      id="description"
                      {...register('description', { required: true })}
                      rows={3}
                      className={`w-full p-2 border rounded-md focus:ring-pharma-green focus:border-pharma-green transition-colors ${
                        formErrors.description ? 'border-state-error ring-1 ring-state-error' : 'border-pharma-gray-darker'
                      }`}
                    />
                    {formErrors.description && <p className="text-state-error text-xs">{formErrors.description}</p>}
                  </div>
                </div>

                {/* Products Selection */}
                <div className="bg-background-light p-6 rounded-lg border border-pharma-gray-dark shadow-card">
                  <h2 className="text-lg font-semibold text-text-primary mb-5">
                    {applyTo === 'PRODUCT' ? 'Product Selection' : 'Bundle Creation'}
                  </h2>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      {applyTo === 'PRODUCT' ? 'Select Products' : 'Create Bundle'}
                    </label>
                    <div className="border border-pharma-gray-darker rounded-md p-4 bg-white">
                      <div className="relative">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            searchProducts();
                          }}
                          placeholder="Search products by name or code..."
                          className="w-full p-2 border border-pharma-gray-darker rounded-md focus:ring-pharma-green focus:border-pharma-green transition-colors"
                        />
                        {searchResults.length > 0 && showSearchResults && (
                          <div className="absolute z-10 w-full mt-1 bg-white shadow-elevated rounded-md border border-pharma-gray-dark max-h-60 overflow-y-auto">
                            {searchResults.map(product => (
                              <div 
                                key={product.productCode}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addProduct(product);
                                }}
                                className="p-2 hover:bg-pharma-gray cursor-pointer transition-colors"
                              >
                                {product.name} <span className="text-text-light text-sm">({product.productCode})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

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
                                  className="ml-2 text-state-error hover:text-red-700"
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
                      
                      {formErrors.products && <p className="text-state-error text-xs mt-2">{formErrors.products}</p>}
                    </div>
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="bg-background-light p-6 rounded-lg border border-pharma-gray-dark shadow-card">
                  <h2 className="text-lg font-semibold text-text-primary mb-5">Usage Limits</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="min_cart_qty" className="block text-sm font-medium text-text-secondary">Min Cart Quantity</label>
                      <input
                        type="number"
                        id="min_cart_qty"
                        {...register('min_cart_qty', { required: true, min: 1 })}
                        className="w-full p-2 border border-pharma-gray-darker rounded-md focus:ring-pharma-green focus:border-pharma-green bg-white"
                      />
                      <p className="text-xs text-text-muted">Minimum quantity required in cart</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="max_uses_per_user" className="block text-sm font-medium text-text-secondary">Max Uses Per User</label>
                      <input
                        type="number"
                        id="max_uses_per_user"
                        {...register('max_uses_per_user', { required: true, min: 1 })}
                        className="w-full p-2 border border-pharma-gray-darker rounded-md focus:ring-pharma-green focus:border-pharma-green bg-white"
                      />
                      <p className="text-xs text-text-muted">Maximum redemptions per customer</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="total_uses_limit" className="block text-sm font-medium text-text-secondary">Total Uses Limit</label>
                      <input
                        type="number"
                        id="total_uses_limit"
                        {...register('total_uses_limit', { required: true, min: 1 })}
                        className="w-full p-2 border border-pharma-gray-darker rounded-md focus:ring-pharma-green focus:border-pharma-green bg-white"
                      />
                      <p className="text-xs text-text-muted">Global limit on total redemptions</p>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="bg-background-light p-6 rounded-lg border border-pharma-gray-dark shadow-card">
                  <h2 className="text-lg font-semibold text-text-primary mb-5">Promotion Period</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="start_datetime" className="block text-sm font-medium text-text-secondary">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        id="start_datetime"
                        {...register('start_datetime', { required: true })}
                        className={`w-full p-2 border rounded-md focus:ring-pharma-green focus:border-pharma-green bg-white ${
                          formErrors.start_datetime ? 'border-state-error ring-1 ring-state-error' : 'border-pharma-gray-darker'
                        }`}
                      />
                      {formErrors.start_datetime && <p className="text-state-error text-xs">{formErrors.start_datetime}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="end_datetime" className="block text-sm font-medium text-text-secondary">End Date & Time</label>
                      <input
                        type="datetime-local"
                        id="end_datetime"
                        {...register('end_datetime', { required: true })}
                        className={`w-full p-2 border rounded-md focus:ring-pharma-green focus:border-pharma-green bg-white ${
                          formErrors.end_datetime ? 'border-state-error ring-1 ring-state-error' : 'border-pharma-gray-darker'
                        }`}
                      />
                      {formErrors.end_datetime && <p className="text-state-error text-xs">{formErrors.end_datetime}</p>}
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="bg-background-light p-6 rounded-lg border border-pharma-gray-dark shadow-card">
                  <h2 className="text-lg font-semibold text-text-primary mb-5">Promotional Materials</h2>
                  
                  <div className="space-y-2">
                    <label htmlFor="files" className="block text-sm font-medium text-text-secondary">Upload Images or PDFs</label>
                    <div className="border-2 border-dashed border-pharma-gray-dark p-6 rounded-md text-center bg-pharma-gray-light transition-colors hover:bg-pharma-gray cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <input 
                        ref={fileInputRef}
                        type="file"
                        id="files"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf"
                      />
                      {formFiles.length === 0 ? (
                        <div className="space-y-1 text-center">
                          <div className="mx-auto h-12 w-12 text-pharma-gray-darker">
                            <svg className="h-8 w-8 mx-auto" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="text-sm text-text-secondary">
                            <span className="font-medium text-pharma-green hover:text-pharma-green-light">Upload files</span>
                            <span> or drag and drop</span>
                          </div>
                          <p className="text-xs text-text-muted">PNG, JPG, GIF, PDF up to 10MB</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-pharma-gray p-2 rounded border border-pharma-gray-dark">
                              <div className="flex items-center">
                                <span className="text-sm truncate text-text-primary">{file.name}</span>
                                <span className="text-xs text-text-muted ml-2">({formatFileSize(file.size)})</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                                type="button"
                                className="text-state-error hover:text-red-700"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="text-sm text-pharma-green hover:text-pharma-green-light mt-3"
                          >
                            Add more files
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    className="px-6 py-2 bg-white border border-pharma-gray-darker text-text-secondary rounded-md hover:bg-pharma-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pharma-gray-darker mr-4 shadow-sm transition-colors"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pharma-green disabled:opacity-50 shadow-sm transition-colors"
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
                    ) : "Create Promotion"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Promotions List View */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">All Promotions</h2>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pharma-green shadow-sm transition-colors"
                  >
                    Create New Promotion
                  </button>
                </div>
                
                {promotions.length === 0 ? (
                  <div className="bg-white border border-pharma-gray-dark rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-pharma-gray-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-text-secondary">No promotions found</h3>
                    <p className="mt-2 text-sm text-text-muted">Get started by creating a new promotion.</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-4 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pharma-green shadow-sm transition-colors"
                    >
                      Create Promotion
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-pharma-gray-dark rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-pharma-gray-dark">
                      <thead className="bg-pharma-gray-dark">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Discount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-pharma-gray-dark">
                        {promotions.map((promotion) => (
                          <tr key={promotion.id} className="hover:bg-pharma-gray-light transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-text-primary">{promotion.name}</div>
                              <div className="text-xs text-text-muted mt-1">{promotion.description && promotion.description.length > 40 ? `${promotion.description.substring(0, 40)}...` : promotion.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                promotion.apply_to === 'PRODUCT' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {promotion.apply_to}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              {promotion.discount_value}{promotion.discount_type === 'PERCENTAGE' ? '%' : ' KSH'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              <div>{new Date(promotion.start_datetime).toLocaleDateString()}</div>
                              <div className="text-xs text-text-muted">to {new Date(promotion.end_datetime).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                promotion.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {promotion.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => handleDeletePromotion(promotion.id || '')}
                                className="text-red-600 hover:text-red-900 ml-4"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {alert && <Alert alert={alert} onClose={() => setAlert(null)} />}
    </>
  );
} 