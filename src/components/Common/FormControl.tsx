import React from 'react';

interface CustomFormControlProps {
  children: React.ReactNode;
  className?: string;
  isInvalid?: boolean;
}

/**
 * Custom form control component
 * Provides consistent styling and behavior for form controls
 */
const FormControl: React.FC<CustomFormControlProps> = ({ 
  children,
  className,
  isInvalid
}) => {
  return (
    <div className={`mb-4 ${isInvalid ? 'has-error' : ''} ${className || ''}`}>
      {children}
    </div>
  );
};

export default FormControl;
