import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useAuth();
  console.log('Current user in PrivateRoute:', currentUser); // Debugging line

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
