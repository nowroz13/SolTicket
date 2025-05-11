import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AlertTriangle size={48} className="text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-300 mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound;