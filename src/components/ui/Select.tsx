import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  variant?: 'default' | 'compact';
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  variant = 'default',
  className = '',
  style,
  ...props
}) => {
  const isCompact = variant === 'compact';

  const baseClasses = isCompact
    ? "w-full border rounded-lg h-7 px-3 text-[11px] font-normal text-[#304166] appearance-none cursor-pointer outline-none transition-all form-select-container"
    : "w-full border rounded-xl h-7 px-4 text-sm font-normal text-[#304166] appearance-none cursor-pointer outline-none transition-all form-select-container";

  return (
    <div className={`w-full ${!isCompact ? 'space-y-1' : 'space-y-1'} group`}>
      {label && (
        <label className="text-[11px]  text-black ml-1 flex items-center gap-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`${baseClasses} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          style={style}
          {...props}
        >
          {options.map((opt: SelectOption) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
