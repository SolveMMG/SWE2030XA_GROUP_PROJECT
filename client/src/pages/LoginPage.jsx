const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">SkillSwap</h1>
        <p className="text-gray-500 text-sm mb-8">Peer skill marketplace for university students</p>

        <a
          href={`${API_BASE}/v1/auth/google`}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.6 29.2 4 24 4 16.4 4 9.8 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.3-5.2C29.4 35.6 26.8 36 24 36c-5.3 0-9.6-2.9-11.3-7H6.3C9.8 35.7 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.5 5.8l6.3 5.2c-.4.3 5.9-4.3 5.9-15 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </a>

        <p className="mt-6 text-xs text-gray-400">
          University email accounts only
        </p>
      </div>
    </div>
  );
}
