import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A route guard component that ensures only users with the 'PlatformManager' role
 * can access the nested routes. Redirects to login if the user is not
 * logged in or does not have the correct role.
 */
function ProtectedPlatformRoute() {
  const [isPlatform, setIsPlatform] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.role === 'PlatformManager') {
          setIsPlatform(true);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage for PlatformManger route", e);
        localStorage.removeItem('loggedInUser');
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Checking platform manager access...</div>;
  }
  return isPlatform ? <Outlet/> : <Navigate to="/login" replace/>;
}

export default ProtectedPlatformRoute;