import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/features/auth/model/use-auth';

import { pagesMap } from './pages-map';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={pagesMap.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
