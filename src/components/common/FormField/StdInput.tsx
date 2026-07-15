import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ─── Label ────────────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ htmlFor?: string; required?: boolean; children: React.ReactNode }> = ({ htmlFor, required, children }) => (
  <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-slate-700 mb-1">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

// ─── Error ────────────────────────────────────────────────────────────────────
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-[12px] font-medium text-red-500 mt-1 ml-0.5">{message}</p> : null;

// ─── Props ────────────────────────────────────────────────────────────────────
export interface StdInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  icon?: LucideIcon;
  error?: string;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  hideErrorText?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const StdInput: React.FC<StdInputProps> = ({
  label,
  icon: Icon,
  error,
  suffix,
  size = 'md',
  required,
  hideErrorText,
  className = '',
  id,
  style,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8  px-3 text-[12px] rounded-lg',
    md: 'h-10 px-4 text-[13px] rounded-xl',
    lg: 'h-12 px-5 text-[14px] rounded-xl',
  };

  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-0.5">
      {label && <FieldLabel htmlFor={inputId} required={required}>{label}</FieldLabel>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <input
          id={inputId}
          className={`
            w-full font-normal text-slate-800
            placeholder:text-slate-400 placeholder:font-normal
            outline-none transition-all form-input-container
            ${sizeClasses[size]}
            ${Icon ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error ? '!border-red-400' : ''}
            ${className}
          `}
          style={style}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {!hideErrorText && <FieldError message={error} />}
    </div>
  );
};
