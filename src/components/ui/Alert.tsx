import React from 'react';
import { AlertMessage } from '@/types/promotion';

interface AlertProps {
  alert: AlertMessage | null;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  const isSuccess = alert.type === 'success';
  
  return (
    <div 
      className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-elevated z-50 ${
        isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {isSuccess ? (
            <svg className="h-5 w-5 text-pharma-green-light" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-state-error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${isSuccess ? 'text-pharma-green-dark' : 'text-state-error'}`}>
            {alert.message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 transition-colors ${
                isSuccess 
                  ? 'bg-green-50 text-pharma-green hover:bg-green-100' 
                  : 'bg-red-50 text-state-error hover:bg-red-100'
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert; 