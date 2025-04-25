import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import Link from 'next/link';

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
      promotion_type: 'PHARMAPLUS',
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
      files: [],
      terms_and_conditions: '',
      rules: '',
      partner_name: '',
      partner_logo: undefined
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
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [termsFile, setTermsFile] = useState<File | null>(null);
  
  const applyTo = watch('apply_to');
  const discountType = watch('discount_type');
  
  // Promotions list state
  const [promotions, setPromotions] = useState<PromotionFormData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Search and filter state for promotions list
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Load promotions from localStorage
  const loadPromotions = () => {
    const storedPromotions = getPromotions();
    setPromotions(storedPromotions);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    loadPromotions();
    showAlert('Promotions list refreshed', 'success');
  };
  
  // Apply filter to promotions
  const applyFilter = (promotionsList: PromotionFormData[], filter: string) => {
    setStatusFilter(filter);
  };
  
  // Change filter
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilter(promotions, filter);
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
    console.log("File upload triggered");
    
    if (event.target.files) {
      try {
        const newFiles = Array.from(event.target.files);
        console.log("Files selected:", newFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
        
        // Simulate upload progress
        setFileUploading(true);
        setUploadProgress(0);
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setFormFiles(prev => {
              const updatedFiles = [...prev, ...newFiles];
              console.log("Updated form files:", updatedFiles);
              return updatedFiles;
            });
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
    } else {
      console.log("No files selected");
    }
  };
  
  // Handle terms file upload
  const handleTermsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setTermsFile(file);
      
      // Read the file contents if it's a text file
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setValue('terms_and_conditions', content);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // For PDFs we just store the file and don't attempt to read/display contents
        setValue('terms_and_conditions', `Terms and conditions from file: ${file.name}`);
      }
      
      // Store file metadata for form submission
      setValue('terms_file', {
        name: file.name,
        size: file.size,
        type: file.type
      });
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
    console.log("Form submitted with data:", data);
    
    if (!validateForm(data)) {
      console.log("Form validation failed with errors:", formErrors);
      showAlert('Please fix the errors in the form.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating dataForStorage with formFiles:", formFiles);
      
      // File objects can't be saved to localStorage directly
      // Create a copy of data without file objects
      const dataForStorage = {
        ...data,
        // Store only the file names instead of file objects
        files: formFiles.map(file => {
          console.log("Processing file:", file);
          try {
            return { 
              name: file.name, 
              size: file.size, 
              type: file.type 
            };
          } catch (fileErr) {
            console.error("Error processing file:", file, fileErr);
            return { name: "Unknown file", size: 0, type: "application/octet-stream" };
          }
        }),
        // Handle partner logo similarly if it exists
        partner_logo: data.partner_logo ? (() => {
          try {
            return { 
              name: data.partner_logo.name, 
              size: data.partner_logo.size, 
              type: data.partner_logo.type 
            };
          } catch (logoErr) {
            console.error("Error processing partner logo:", data.partner_logo, logoErr);
            return undefined;
          }
        })() : undefined
      };
      
      console.log("Final dataForStorage:", dataForStorage);
      
      // Save promotion to localStorage
      savePromotion(dataForStorage);
      
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
    setValue('partner_name', '');
    setValue('partner_logo', undefined);
    
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
  
  // Apply filters to promotions list
  const filteredPromotions = useMemo(() => {
    return promotions
      .filter(promo => {
        // Apply status filter
        if (statusFilter !== 'all') {
          const now = new Date();
          const endDate = new Date(promo.end_datetime);
          
          if (statusFilter === 'active' && (!promo.is_active || endDate < now)) {
            return false;
          }
          if (statusFilter === 'inactive' && promo.is_active) {
            return false;
          }
          if (statusFilter === 'expired' && endDate >= now) {
            return false;
          }
        }
        
        // Apply type filter
        if (typeFilter !== 'all' && promo.apply_to !== typeFilter) {
          return false;
        }
        
        // Apply search term
        if (searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase();
          return (
            promo.name.toLowerCase().includes(searchLower) ||
            (promo.description && promo.description.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      });
  }, [promotions, searchTerm, statusFilter, typeFilter]);
  
  // Render
  return (
    <>
      <Head>
        <title>Promotions | PharmaPlus Admin</title>
      </Head>
      <div className="bg-background-light rounded-lg shadow">
        {/* Header with branded style */}
        <div className="bg-pharma-green py-4 md:py-6 px-4 md:px-8 rounded-t-lg">
          <h1 className="text-xl md:text-2xl font-bold text-white">Promotions Management</h1>
          <p className="text-green-100 mt-1 opacity-90">Create and manage time-based promotions for products or bundles.</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b border-pharma-gray-dark overflow-x-auto">
          <div className="px-4 md:px-8 flex space-x-4 md:space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 md:py-4 px-2 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'create'
                  ? 'border-pharma-green text-pharma-green'
                  : 'border-transparent text-text-secondary hover:text-pharma-green hover:border-pharma-green-light'
              }`}
            >
              Create Promotion
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 md:py-4 px-2 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        <div className="p-4 md:p-8">
          {activeTab === 'create' ? (
            <>
              {/* Form Title */}
              <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Create New Promotion</h2>
                <p className="text-text-muted mt-2">Fill out the form below to create a new promotional campaign.</p>
              </div>

              {/* Promotion Type Selector */}
              <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
                <h2 className="text-lg font-semibold text-text-primary mb-5">Promotion Type</h2>
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
                <p className="text-sm text-text-muted mt-2">
                  {applyTo === 'PRODUCT' 
                    ? 'Apply promotion to individual product(s)' 
                    : 'Create a bundle of products for promotion'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-background-light p-6 rounded-lg border border-pharma-gray-dark shadow-card">
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

                  {/* Promotion Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Promotion Type
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="promotion-type-pharmaplus"
                          type="radio"
                          value="PHARMAPLUS"
                          className="h-4 w-4 text-pharma-green border-pharma-gray-dark focus:ring-pharma-green"
                          {...register('promotion_type')}
                          defaultChecked
                        />
                        <label htmlFor="promotion-type-pharmaplus" className="ml-3 block text-sm text-text-primary">
                          PharmaPlus Promotion
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="promotion-type-partner"
                          type="radio"
                          value="PARTNER"
                          className="h-4 w-4 text-pharma-green border-pharma-gray-dark focus:ring-pharma-green"
                          {...register('promotion_type')}
                        />
                        <label htmlFor="promotion-type-partner" className="ml-3 block text-sm text-text-primary">
                          Partner Promotion
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Partner Information (conditional) */}
                  {watch('promotion_type') === 'PARTNER' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-pharma-gray-light rounded-md border border-pharma-gray-dark">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="partner-name">
                          Partner Name
                        </label>
                        <input
                          type="text"
                          id="partner-name"
                          className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm"
                          placeholder="Enter partner company name"
                          {...register('partner_name')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Partner Logo (optional)
                        </label>
                        <input
                          type="file"
                          className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pharma-green file:text-white hover:file:bg-pharma-green-dark"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setValue('partner_logo', e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Discount Information */}
                  <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-5">Discount Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="discount_type" className="block text-sm font-medium text-text-secondary mb-2">Discount Type</label>
                        <div className="relative">
                          <select
                            id="discount_type"
                            {...register('discount_type')}
                            className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm appearance-none pl-3 pr-10 py-2"
                          >
                            <option value="PERCENTAGE">Percentage Discount (%)</option>
                            <option value="FIXED">Fixed Amount (KSH)</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-text-muted">
                          {discountType === 'PERCENTAGE' 
                            ? 'Percentage discount applied to the product price' 
                            : 'Fixed amount discount in KSH'}
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="discount_value" className="block text-sm font-medium text-text-secondary mb-2">
                          Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '(KSH)'}
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                          <input
                            type="number"
                            id="discount_value"
                            {...register('discount_value')}
                            min="0"
                            max={discountType === 'PERCENTAGE' ? "100" : undefined}
                            className={`block w-full rounded-md shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm pl-3 pr-12 py-2 ${
                              formErrors.discount_value 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-pharma-gray-dark'
                            }`}
                            placeholder={discountType === 'PERCENTAGE' ? "e.g. 15" : "e.g. 500"}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              {discountType === 'PERCENTAGE' ? '%' : 'KSH'}
                            </span>
                          </div>
                        </div>
                        {formErrors.discount_value && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.discount_value}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-pharma-gray">
                      <div>
                        <label htmlFor="is_active" className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                        <div className="flex items-center space-x-3">
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
                          <span className="text-sm text-text-secondary">
                            {watch('is_active') ? 'Active - Promotion will be live immediately' : 'Inactive - Promotion will be created but not active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promotion Settings - Date Range and Usage Limits */}
                  <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-5">Promotion Settings</h2>
                    
                    {/* Date Range */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-text-primary mb-3">Promotion Period</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="start_datetime" className="block text-sm font-medium text-text-secondary mb-2">Start Date & Time</label>
                          <input
                            type="datetime-local"
                            id="start_datetime"
                            {...register('start_datetime')}
                            className={`block w-full rounded-md shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm ${
                              formErrors.start_datetime ? 'border-red-500' : 'border-pharma-gray-dark'
                            }`}
                          />
                          {formErrors.start_datetime && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.start_datetime}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="end_datetime" className="block text-sm font-medium text-text-secondary mb-2">End Date & Time</label>
                          <input
                            type="datetime-local"
                            id="end_datetime"
                            {...register('end_datetime')}
                            className={`block w-full rounded-md shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm ${
                              formErrors.end_datetime ? 'border-red-500' : 'border-pharma-gray-dark'
                            }`}
                          />
                          {formErrors.end_datetime && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.end_datetime}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Usage Limits */}
                    <div>
                      <h3 className="text-md font-medium text-text-primary mb-3">Usage Limits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="min_cart_qty" className="block text-sm font-medium text-text-secondary mb-2">Min. Cart Quantity</label>
                          <input
                            type="number"
                            id="min_cart_qty"
                            min="1"
                            {...register('min_cart_qty')}
                            className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-text-muted">Minimum quantity required in cart</p>
                        </div>
                        
                        <div>
                          <label htmlFor="max_uses_per_user" className="block text-sm font-medium text-text-secondary mb-2">Max Uses Per User</label>
                          <input
                            type="number"
                            id="max_uses_per_user"
                            min="1"
                            {...register('max_uses_per_user')}
                            className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-text-muted">Maximum redemptions per customer</p>
                        </div>
                        
                        <div>
                          <label htmlFor="total_uses_limit" className="block text-sm font-medium text-text-secondary mb-2">Total Uses Limit</label>
                          <input
                            type="number"
                            id="total_uses_limit"
                            min="1"
                            {...register('total_uses_limit')}
                            className="block w-full rounded-md border-pharma-gray-dark shadow-sm focus:border-pharma-green focus:ring-pharma-green sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-text-muted">Global limit on total redemptions</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Products Selection */}
                <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card">
                  <h2 className="text-lg font-semibold text-text-primary mb-5">
                    {applyTo === 'PRODUCT' ? 'Product Selection' : 'Bundle Creation'}
                  </h2>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-text-secondary">
                      {applyTo === 'PRODUCT' ? 'Select Products' : 'Create Bundle'}
                    </label>
                    
                    {/* Search box with icon */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pharma-gray-darker" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          searchProducts();
                        }}
                        placeholder="Search products by name or code..."
                        className="pl-10 w-full p-2 border border-pharma-gray-darker rounded-md focus:ring-pharma-green focus:border-pharma-green transition-colors"
                      />
                    </div>

                    {/* Search results dropdown */}
                    <div className="relative">
                      {searchResults.length > 0 && showSearchResults && (
                        <div className="absolute z-10 w-full mt-1 bg-white shadow-elevated rounded-md border border-pharma-gray-dark max-h-60 overflow-y-auto">
                          {searchResults.map(product => (
                            <div 
                              key={product.productCode}
                              onClick={(e) => {
                                e.stopPropagation();
                                addProduct(product);
                              }}
                              className="p-3 hover:bg-pharma-gray cursor-pointer transition-colors border-b border-pharma-gray last:border-0"
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-text-muted text-sm">Code: {product.productCode}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected products */}
                    <div className="mt-4 border border-pharma-gray-dark rounded-md p-4 bg-pharma-gray-light">
                      <h3 className="font-medium text-sm text-text-secondary mb-3">Selected Products</h3>
                      
                      {selectedProducts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedProducts.map(product => (
                            <div 
                              key={product.productCode}
                              className="bg-white border border-pharma-gray-dark rounded-full px-3 py-1.5 text-sm flex items-center shadow-sm"
                            >
                              <span className="text-text-primary font-medium">{product.name}</span>
                              <span className="text-text-muted text-xs ml-1.5">({product.productCode})</span>
                              <button 
                                onClick={() => removeProduct(product.productCode)} 
                                className="ml-2 text-pharma-gray-darker hover:text-red-500 transition-colors"
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted py-2">No products selected. Use the search box above to find and add products.</p>
                      )}
                      
                      {formErrors.products && (
                        <p className="mt-2 text-sm text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {formErrors.products}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-sm text-pharma-gray-darker mt-2">
                      <p>
                        <span className="font-medium">Tip:</span> {applyTo === 'PRODUCT' 
                          ? 'Select multiple products to apply the same discount to all of them.' 
                          : 'Create a bundle by selecting multiple products that will be sold together.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-white p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6">
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
                            onClick={() => {
                              setTermsFile(null);
                              setValue('terms_file', undefined);
                            }}
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
                        Select Files
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
                              {file.type.includes('image') ? (
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
                                  <p className="mt-2 text-sm font-medium text-pharma-green">{file.type.split('/')[1]?.toUpperCase() || 'File'}</p>
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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">All Promotions</h2>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pharma-green shadow-sm transition-colors w-full md:w-auto"
                  >
                    Create New Promotion
                  </button>
                </div>
                
                {/* Promotions List Tab */}
                <div className="bg-white rounded-lg shadow-card p-4 md:p-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search promotions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-pharma-gray-dark rounded-md w-full focus:outline-none focus:ring-2 focus:ring-pharma-green focus:border-transparent"
                      />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-pharma-gray-dark rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pharma-green focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                      </select>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-pharma-gray-dark rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pharma-green focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="PRODUCT">Product</option>
                        <option value="BUNDLE">Bundle</option>
                      </select>
                    </div>
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
                      <div className="responsive-table">
                        <table className="min-w-full divide-y divide-pharma-gray-dark">
                          <thead className="bg-pharma-gray-dark">
                            <tr>
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Discount</th>
                              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-pharma-gray-dark">
                            {filteredPromotions.map((promotion) => (
                              <tr key={promotion.id} className="hover:bg-pharma-gray-light transition-colors">
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                  <Link href={`/promotions/${promotion.id}`}>
                                    <div className="text-sm font-medium text-text-primary hover:text-pharma-green hover:underline cursor-pointer">{promotion.name}</div>
                                  </Link>
                                  <div className="text-xs text-text-muted mt-1 md:hidden">
                                    {new Date(promotion.start_datetime).toLocaleDateString()} - 
                                    {new Date(promotion.end_datetime).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    promotion.apply_to === 'PRODUCT' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {promotion.apply_to}
                                  </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                  {promotion.discount_value}{promotion.discount_type === 'PERCENTAGE' ? '%' : ' KSH'}
                                </td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                  <div>{new Date(promotion.start_datetime).toLocaleDateString()}</div>
                                  <div className="text-xs text-text-muted">to {new Date(promotion.end_datetime).toLocaleDateString()}</div>
                                </td>
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    promotion.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {promotion.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link href={`/promotions/${promotion.id}`}>
                                    <span className="text-pharma-blue hover:text-blue-700 cursor-pointer">View</span>
                                  </Link>
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
                    </div>
                  )}
                </div>
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