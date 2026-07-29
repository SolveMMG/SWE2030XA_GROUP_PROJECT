import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      navigate('/login?error=callback', { replace: true });
      return;
    }

    api.post('/auth/exchange', { code })
      .then(({ data }) => {
        login(data.user, data.token);
        navigate(data.user.isNewUser ? '/profile' : '/', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=callback', { replace: true });
      });
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Signing you in&hellip;</p>
      </div>
    </div>
  );
}
