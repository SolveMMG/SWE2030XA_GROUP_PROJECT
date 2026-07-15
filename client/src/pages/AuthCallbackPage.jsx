import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');

    if (!token || !refreshToken) {
      navigate('/login?error=callback');
      return;
    }

    const userData = {
      id:       parseInt(params.get('userId')),
      name:     params.get('name') ?? '',
      email:    params.get('email') ?? '',
      photoUrl: params.get('photoUrl') || null,
    };

    login(userData, token, refreshToken);

    const isNewUser = params.get('isNewUser') === '1';
    const redirect = localStorage.getItem('redirectAfterLogin');
    localStorage.removeItem('redirectAfterLogin');
    navigate(isNewUser ? '/profile' : (redirect || '/'));
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
