import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-black text-gray-200 select-none">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to marketplace
      </Link>
    </main>
  );
}
