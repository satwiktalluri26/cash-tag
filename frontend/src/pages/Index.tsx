import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Login from './Login';

const Index = () => {
  const { isAuthenticated, isConnected } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      navigate('/dashboard');
    } else if (isAuthenticated && !isConnected) {
      navigate('/initialize');
    }
  }, [isAuthenticated, isConnected, navigate]);

  return <Login />;
};

export default Index;
