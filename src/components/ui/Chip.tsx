import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Chip / Pill Badge — Standard reusable component
//
// Matches the reference design: pill-shaped, icon + label, light border.
// Used in tables (status, tax, category badges) and anywhere a pill-style
// badge / action chip is needed throughout the application.
//
// Usage examples:
//   <Chip label="Active"    icon={CheckCircle} color="#15803D" bg="#F0FDF4" border="#BBF7D0" />
//   <Chip label="Filer"     icon={ShieldCheck} color="#15803D" bg="#F0FDF4" border="#BBF7D0" />
//   <Chip label="Non-Filer" icon={AlertCircle} color="#D97706" bg="#FFFBEB" border="#FDE68A" />
//   <Chip label="Inactive"  color="#BE123C"   bg="#FFF1F2"   border="#FECDD3" />
//
//   // Action / suggestion chip (clickable, with hover, like the AI bar chips)
//   <Chip label="Add customer" icon={PlusCircle} iconColor="#10B981" onClick={() => {}} />
// ---------------------------------------------------------------------------

export interface ChipProps {
  /** Text displayed inside the chip */
  label: string;

  /** Optional Lucide icon rendered to the left of the label */
  icon?: LucideIcon;

  /** Icon colour — defaults to `color` if omitted */
  iconColor?: string;

  /** Label / text colour */
  color?: string;

  /** Background fill */
  bg?: string;

  /** Border colour */
  border?: string;

  /** Extra tailwind classes to merge */
  className?: string;

  /** Make the chip clickable — adds hover / cursor-pointer styles */
  onClick?: () => void;

  /** Size preset. Defaults to 'sm' */
  size?: 'xs' | 'sm' | 'md';
}

const sizes = {
  xs: {
    wrapper: 'px-2 py-0.5 gap-1 text-[9px]',
    icon: 'w-2.5 h-2.5',
  },
  sm: {
    wrapper: 'px-2.5 py-0.5 gap-1.5 text-[11px]',
    icon: 'w-3 h-3',
  },
  md: {
    wrapper: 'px-3 py-0.5 gap-1.5 text-[12px]',
    icon: 'w-3.5 h-3.5',
  },
};

export const Chip: React.FC<ChipProps> = ({
  label,
  icon: Icon,
  iconColor,
  color = '#475569',
  bg = '#FFFFFF',
  border = '#E2E8F0',
  className = '',
  onClick,
  size = 'sm',
}) => {
  const s = sizes[size];

  const base =
    `inline-flex items-center rounded-full border font-normal transition-all select-none whitespace-nowrap ${s.wrapper}`;
  const interactive = onClick
    ? 'cursor-pointer hover:shadow-sm hover:brightness-95 active:scale-95'
    : '';

  const resolvedIconColor = iconColor ?? color;

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={`${base} ${interactive} ${className}`}
      style={{ color, backgroundColor: bg, borderColor: border }}
    >
      {Icon && (
        <Icon
          className={s.icon}
          style={{ color: resolvedIconColor, flexShrink: 0 }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Pre-built semantic chip presets for quick reuse
// ---------------------------------------------------------------------------

type SemanticChipProps = Omit<ChipProps, 'color' | 'bg' | 'border'>;

/** Green "Active" pill */
export const ActiveChip: React.FC<SemanticChipProps> = (props) => (
  <Chip color="#15803D" bg="#F0FDF4" border="#BBF7D0" {...props} />
);

/** Red "Inactive" pill */
export const InactiveChip: React.FC<SemanticChipProps> = (props) => (
  <Chip color="#BE123C" bg="#FFF1F2" border="#FECDD3" {...props} />
);

/** Emerald "Filer" pill */
export const FilerChip: React.FC<SemanticChipProps> = (props) => (
  <Chip color="#15803D" bg="#F0FDF4" border="#BBF7D0" {...props} />
);

/** Amber "Non-Filer" pill */
export const NonFilerChip: React.FC<SemanticChipProps> = (props) => (
  <Chip color="#B45309" bg="#FFFBEB" border="#FDE68A" {...props} />
);

/** Blue info pill */
export const InfoChip: React.FC<SemanticChipProps> = (props) => (
  <Chip color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" {...props} />
);

/** Slate neutral pill */
export const NeutralChip: React.FC<SemanticChipProps> = (props) => (
  <Chip color="#475569" bg="#F8FAFC" border="#E2E8F0" {...props} />
);

export default Chip;
