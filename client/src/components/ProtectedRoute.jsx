import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { authUser, checkAuthUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthUser();
      setIsChecking(false);
    };
    checkAuth();
  }, [checkAuthUser]);

  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/signup" replace />;
  }

  return children;
};

export default ProtectedRoute;

