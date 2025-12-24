import { Navigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';
import { Role } from '../../types';

interface Props {
  element: ReactElement;
  roles?: Role[];
}

export function ProtectedRoute({ element, roles }: Props): ReactElement {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
}
