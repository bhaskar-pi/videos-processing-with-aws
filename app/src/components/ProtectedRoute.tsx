import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
 const token = localStorage.getItem('token')
  
  return token ? <>{element}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
