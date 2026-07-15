import React from 'react';

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
export interface SelectOption {
  value: string;
  label: string;
}

export interface StdSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  hideErrorText?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const StdSelect: React.FC<StdSelectProps> = ({
  label,
  options,
  error,
  size = 'md',
  required,
  hideErrorText,
  className = '',
  id,
  style,
  value,
  ...props
}) => {
  const isPlaceholder = !value;

  const sizeClasses = {
    sm: 'h-8  pl-3   pr-8  text-[12px] rounded-lg',
    md: 'h-10 pl-4   pr-10 text-[13px] rounded-xl',
    lg: 'h-12 pl-5   pr-10 text-[14px] rounded-xl',
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-0.5">
      {label && <FieldLabel htmlFor={inputId} required={required}>{label}</FieldLabel>}
      <div className="relative">
        <select
          id={inputId}
          value={value}
          className={`
            w-full border appearance-none cursor-pointer font-normal
            outline-none transition-all form-select-container bg-white
            ${isPlaceholder ? 'text-slate-400' : 'text-slate-800'}
            ${sizeClasses[size]}
            ${error ? '!border-red-400' : ''}
            ${className}
          `}
          style={style}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-800 bg-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {!hideErrorText && <FieldError message={error} />}
    </div>
  );
};
