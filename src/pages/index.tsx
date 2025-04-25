import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getPromotions } from '@/utils/helpers';
import { PromotionFormData } from '@/types/promotion';

export default function Dashboard() {
  const [promotions, setPromotions] = useState<PromotionFormData[]>([]);
  const [activePromotions, setActivePromotions] = useState<number>(0);
  const [expiringSoon, setExpiringSoon] = useState<number>(0);

  useEffect(() => {
    // Load promotions from localStorage
    const loadedPromotions = getPromotions();
    setPromotions(loadedPromotions);
    
    // Count active promotions
    const now = new Date();
    const active = loadedPromotions.filter(p => 
      p.is_active && new Date(p.end_datetime) > now
    ).length;
    setActivePromotions(active);
    
    // Count promotions expiring in the next 7 days
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const expiring = loadedPromotions.filter(p => 
      p.is_active && 
      new Date(p.end_datetime) > now && 
      new Date(p.end_datetime) < sevenDaysLater
    ).length;
    setExpiringSoon(expiring);
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard | PharmaPlus Admin</title>
      </Head>
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h2>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg border border-pharma-gray-dark shadow-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-muted text-sm">Total Promotions</p>
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{promotions.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/promotions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all promotions
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg border border-pharma-gray-dark shadow-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-muted text-sm">Active Promotions</p>
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{activePromotions}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/promotions" className="text-green-600 hover:text-green-800 text-sm font-medium">
                Manage active promotions
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg border border-pharma-gray-dark shadow-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-muted text-sm">Expiring Soon</p>
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{expiringSoon}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/promotions" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                View expiring promotions
              </Link>
            </div>
          </div>
        </div>
        
        {/* Create Promotion Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg border border-pharma-gray-dark shadow-card mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-text-primary">Create New Promotion</h3>
              <p className="text-text-muted mt-2">Launch a new promotional campaign for products or bundles</p>
            </div>
            <Link href="/promotions" className="mt-4 md:mt-0 w-full md:w-auto px-6 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark transition-colors text-center">
              Create Promotion
            </Link>
          </div>
        </div>
        
        {/* Recent Promotions */}
        <div className="bg-white p-4 md:p-6 rounded-lg border border-pharma-gray-dark shadow-card">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-text-primary">Recent Promotions</h3>
            <Link href="/promotions">
              <span className="text-pharma-green hover:underline text-sm">View All</span>
            </Link>
          </div>
          
          {promotions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-10 w-10 md:h-12 md:w-12 text-pharma-gray-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-base md:text-lg font-medium text-text-secondary">No promotions found</h3>
              <p className="mt-2 text-sm text-text-muted">Get started by creating a new promotion.</p>
              <Link href="/promotions">
                <span className="mt-4 inline-block px-4 py-2 bg-pharma-green text-white rounded-md hover:bg-pharma-green-dark">
                  Create Promotion
                </span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto responsive-table">
              <table className="min-w-full divide-y divide-pharma-gray-dark">
                <thead className="bg-pharma-gray">
                  <tr>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Discount</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">End Date</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pharma-gray-dark">
                  {promotions.slice(0, 5).map((promotion) => {
                    const isExpired = new Date(promotion.end_datetime) < new Date();
                    let statusClass = "";
                    let statusText = "";
                    
                    if (isExpired) {
                      statusClass = "bg-gray-100 text-gray-800";
                      statusText = "Expired";
                    } else if (!promotion.is_active) {
                      statusClass = "bg-yellow-100 text-yellow-800";
                      statusText = "Inactive";
                    } else {
                      statusClass = "bg-green-100 text-green-800";
                      statusText = "Active";
                    }
                    
                    return (
                      <tr key={promotion.id} className="hover:bg-pharma-gray-light transition-colors">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <Link href={`/promotions/${promotion.id}`}>
                            <div className="text-sm font-medium text-text-primary hover:text-pharma-green hover:underline cursor-pointer text-truncate">{promotion.name}</div>
                          </Link>
                          <div className="text-xs text-text-secondary mt-1 md:hidden">
                            {new Date(promotion.end_datetime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {promotion.discount_value}{promotion.discount_type === 'PERCENTAGE' ? '%' : ' KSH'}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {new Date(promotion.end_datetime).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/promotions/${promotion.id}`} className="text-pharma-blue hover:text-blue-700">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 