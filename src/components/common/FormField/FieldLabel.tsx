import React from 'react';

// ─── Shared FieldLabel ────────────────────────────────────────────────────────
interface FieldLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ htmlFor, required, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[13px] font-semibold text-slate-700 mb-1"
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

// ─── Shared FieldError ────────────────────────────────────────────────────────
export const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-[12px] font-medium text-red-500 mt-1 ml-0.5">{message}</p> : null;
