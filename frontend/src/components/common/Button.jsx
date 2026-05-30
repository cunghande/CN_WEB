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
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-black transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-950';

  const variants = {
    primary: 'bg-slate-950 text-white shadow-sm hover:bg-slate-800 focus:ring-slate-500 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
    secondary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 focus:ring-emerald-400',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus:ring-rose-500',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-300 dark:text-slate-200 dark:hover:bg-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
