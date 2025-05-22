import { useState, useEffect } from "react";

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ErrorMessage = ({ message, onDismiss, autoClose = true, duration = 5000 }: ErrorMessageProps) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);
  
  return (
    <div className="fixed inset-x-0 top-4 mx-auto max-w-md z-50 px-4">
      <div className="bg-white text-gray-800 px-4 py-3 rounded-md shadow-lg flex items-center border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-200">
        <span className="material-icons text-red-600 mr-3 text-base">error</span>
        <span className="text-sm">{message}</span>
        <button 
          className="ml-auto text-gray-500 hover:text-gray-800 transition-colors"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
