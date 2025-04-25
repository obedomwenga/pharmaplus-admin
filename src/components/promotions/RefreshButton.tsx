import React from 'react';

interface RefreshButtonProps {
  onRefresh: () => void;
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, className = '' }) => {
  return (
    <button 
      onClick={onRefresh}
      className={`px-3 py-1 rounded-md text-sm font-medium bg-pharma-gray-light text-text-secondary hover:bg-pharma-gray-dark transition-colors flex items-center ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </button>
  );
};

export default RefreshButton; 