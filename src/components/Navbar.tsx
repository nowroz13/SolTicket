import { FC, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Menu, X, Ticket } from 'lucide-react';

const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { publicKey } = useWallet();
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="bg-slate-800 bg-opacity-80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                SolTicket
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {publicKey && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-event" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Create Event
                </Link>
              </>
            )}
            <WalletMultiButton className="!bg-gradient-to-r from-purple-500 to-blue-500 !rounded-lg" />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {publicKey && (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:text-white py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-event"
                  className="block text-gray-300 hover:text-white py-2"
                >
                  Create Event
                </Link>
              </>
            )}
            <div className="py-2">
              <WalletMultiButton className="!bg-gradient-to-r from-purple-500 to-blue-500 !rounded-lg w-full !justify-center" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;