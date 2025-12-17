import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-lg font-bold tracking-wide transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-md shadow-blue-200",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white border-transparent shadow-md shadow-red-200",
    // Neon adapted for light mode: High contrast blue
    neon: "bg-white border-blue-600 text-blue-700 hover:bg-blue-50 hover:shadow-lg shadow-md"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};