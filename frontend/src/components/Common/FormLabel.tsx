import React from 'react';

interface CustomFormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

/**
 * Custom form label component
 * Provides consistent styling for form labels with optional required indicator
 */
const FormLabel: React.FC<CustomFormLabelProps> = ({ 
  children, 
  required = false,
  htmlFor,
  className
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className || ''}`}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-0.5">*</span>
      )}
    </label>
  );
};

export default FormLabel;
