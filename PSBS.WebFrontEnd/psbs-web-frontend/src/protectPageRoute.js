import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const userToken = sessionStorage.getItem('token');
    setIsAuthenticated(userToken ? true : false);
  }, []); 

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; 
  }

  return children; 
};

export default ProtectedRoute;
