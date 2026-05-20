import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-premium-700 text-white shadow-sm hover:bg-premium-800 focus:ring-premium-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400',
    outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:ring-premium-500',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
