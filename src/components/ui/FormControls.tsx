import React, { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, maxHeight = "auto", className = "", style }, ref) => (
    <div
      ref={ref}
      className={`custom-scrollbar ${className}`}
      style={{
        maxHeight,
        overflowY: className.includes('overflow-y-visible') ? 'visible' : 'auto',
        ...style
      }}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  icon?: LucideIcon;
  error?: string;
  variant?: 'default' | 'compact' | 'transparent';
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, variant = 'default', suffix, className = '', ...props }) => {
  const isTransparent = variant === 'transparent';

  const baseClasses = isTransparent
    ? "w-full bg-transparent border-none text-[11px] font-bold outline-none placeholder:text-slate-200 focus:border-[#2759CD]"
    : variant === 'compact'
      ? "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-lg h-7 px-2 py-0 text-[11px] font-bold text-[#304166] placeholder:text-slate-300 focus:border-[#2759CD] outline-none transition-all"
      : "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl h-7 pr-4 py-0 text-sm font-bold text-[#304166] placeholder:text-slate-300 focus:border-[#2759CD] outline-none transition-all";

  const paddingLeft = !isTransparent && Icon ? 'pl-11' : (!isTransparent && variant === 'default' ? 'px-4' : '');

  return (
    <div className={`w-full ${!isTransparent ? 'space-y-1 group' : ''}`}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        )}
        <input
          className={`${baseClasses} ${paddingLeft} ${suffix ? 'pr-8' : ''} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
};

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: React.ReactNode;
  options: { value: string; label: string }[];
  error?: string;
  variant?: 'default' | 'compact';
}

export const Select: React.FC<SelectProps> = ({ label, options, error, variant = 'default', className = '', ...props }) => {
  const isCompact = variant === 'compact';

  const baseClasses = isCompact
    ? "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-lg h-7 px-3 text-[11px] font-bold text-[#304166] appearance-none cursor-pointer focus:border-[#2759CD] outline-none transition-all"
    : "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl h-7 px-4 text-sm font-bold text-[#304166] appearance-none cursor-pointer focus:border-[#2759CD] outline-none transition-all";

  return (
    <div className={`w-full ${!isCompact ? 'space-y-1' : 'space-y-1'} group`}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`${baseClasses} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
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

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1 w-full group">
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl py-2 px-5 
          text-[13px] font-bold text-[#304166] placeholder:text-slate-300 
          focus:border-[#2759CD] outline-none transition-all resize-none
          ${error ? 'border-red-500 focus:ring-red-500/5' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

interface ComboBoxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string; subtitle?: string }[];
  placeholder?: string;
  variant?: 'default' | 'compact';
  icon?: LucideIcon;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  onQueryChange?: (query: string) => void;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label, value, onChange, options, placeholder = "Search...", variant = 'default', icon: Icon = Search, error, className = '', autoFocus, onQueryChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [openUpwards, setOpenUpwards] = useState(false);

  const isCompact = variant === 'compact';
  const selectedOption = options.find(opt => opt.id === value);

  // When closed, we show the selected option name. When open, we show the search query.
  const displayValue = isOpen ? query : (selectedOption?.name || "");

  const filtered = options.filter(opt =>
    opt.name.toLowerCase().includes(query.toLowerCase()) ||
    opt.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 220; // estimated max height (200px ScrollArea + padding/border)
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setOpenUpwards(shouldOpenUpwards);
      setCoords({
        top: shouldOpenUpwards
          ? rect.top - dropdownHeight - 4
          : rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleUpdate = () => updateCoords();
      window.addEventListener('resize', handleUpdate);
      window.addEventListener('scroll', handleUpdate, true); // true catches nested scrollbar scroll events
      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedContainer = containerRef.current && containerRef.current.contains(e.target as Node);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target as Node);

      if (!clickedContainer && !clickedDropdown) {
        setIsOpen(false);
        setQuery("");
        if (onQueryChange) onQueryChange("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`
            relative flex items-center transition-all border overflow-hidden
            ${isCompact ? 'rounded-lg h-7' : 'rounded-md h-8'}
            ${isOpen ? 'border-[#2759CD] shadow-[0_0_0_4px_rgba(39,89,205,0.05)] bg-white' : 'border-[#304166]/10 bg-[#EFF5FC]'}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
        >
          <div className="shrink-0 pl-3 flex items-center justify-center">
            <Icon className={`text-slate-300 ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            className={`
              flex-1 bg-transparent border-none outline-none font-bold text-[#304166] 
              placeholder:text-slate-300 pl-2.5 pr-9 py-0 ${isCompact ? 'text-[11px]' : 'text-sm'}
            `}
            placeholder={placeholder}
            value={displayValue}
            autoFocus={autoFocus}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (onQueryChange) onQueryChange(val);
              if (!isOpen) setIsOpen(true);
            }}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 flex items-center">
            <ChevronDown
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
            />
          </div>
        </div>

        {mounted && createPortal(
          <AnimatePresence>
            {isOpen && query.length >= 3 && (
              <motion.div
                ref={dropdownRef}
                layout={false}
                initial={{ opacity: 0, y: openUpwards ? -5 : 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpwards ? -5 : 5, scale: 0.98 }}
                className="fixed z-[99999] bg-white border border-[#304166]/10 rounded-xl shadow-xl overflow-hidden"
                style={{
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                }}
              >
                <ScrollArea maxHeight="200px" className="p-1.5">
                  {filtered.length > 0 ? (
                    filtered.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(opt.id);
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all
                          ${value === opt.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}
                        `}
                      >
                        <div>
                          <p className={`font-bold ${value === opt.id ? 'text-indigo-600' : 'text-[#304166]'} text-[12px]`}>
                            {opt.name}
                          </p>
                          {opt.subtitle && (
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{opt.subtitle}</p>
                          )}
                        </div>
                        {value === opt.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-[11px] font-bold text-slate-400">No results found</p>
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
};
