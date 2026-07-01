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
export interface StdTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hideErrorText?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const StdTextArea: React.FC<StdTextAreaProps> = ({
  label,
  error,
  required,
  hideErrorText,
  className = '',
  id,
  style,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-0.5">
      {label && <FieldLabel htmlFor={inputId} required={required}>{label}</FieldLabel>}
      <textarea
        id={inputId}
        className={`
          w-full rounded-xl py-3 px-4
          text-[13px] font-normal text-slate-800
          placeholder:text-slate-400 placeholder:font-normal
          outline-none transition-all resize-none custom-scrollbar
          form-textarea-container
          ${error ? '!border-red-400' : ''}
          ${className}
        `}
        style={style}
        {...props}
      />
      {!hideErrorText && <FieldError message={error} />}
    </div>
  );
};
