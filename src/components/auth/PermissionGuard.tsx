import React from 'react';
import { usePermissions, type FunctionId } from '../../context/PermissionContext';

interface Props {
  companyId: string;
  functionId: FunctionId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<Props> = ({ companyId, functionId, children, fallback = null }) => {
  const { isFunctionEnabled } = usePermissions();

  if (isFunctionEnabled(companyId, functionId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
