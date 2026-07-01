import React from 'react';
import { Button } from './Button';
import type { ButtonProps } from './Button';
import { Plus, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ActionButtonProps extends Omit<ButtonProps, 'icon'> {}

export const AddButton: React.FC<ActionButtonProps> = ({ children = 'Add', ...props }) => {
  const { brand } = useTheme();
  return (
    <Button
      variant="primary"
      icon={Plus}
      style={{ backgroundColor: brand.primary }}
      {...props}
      size="sm"
    >
      {children}
    </Button>
  );
};

export const SaveButton: React.FC<ActionButtonProps> = ({ children = 'Save', ...props }) => {
  return (
    <Button
      variant="success"
      icon={Save}
      {...props}
      size="sm"
    >
      {children}
    </Button>
  );
};
