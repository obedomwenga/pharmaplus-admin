import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    console.log('404 Error - Requested path:', router.asPath);
  }, [router.asPath]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you requested could not be found.</p>
        
        <div className="bg-gray-100 rounded p-4 mb-6 text-left">
          <p className="text-sm font-mono overflow-x-auto">
            <strong>Requested URL:</strong> {router.asPath}
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link href="/" className="w-full px-4 py-2 bg-pharma-green text-white rounded hover:bg-pharma-green-dark transition-colors">
            Go to Dashboard
          </Link>
          <Link href="/promotions" className="w-full px-4 py-2 border border-pharma-green text-pharma-green rounded hover:bg-pharma-green hover:text-white transition-colors">
            View Promotions
          </Link>
          <button 
            onClick={() => router.back()} 
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 