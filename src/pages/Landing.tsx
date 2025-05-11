import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Ticket, QrCode, Calendar, Shield } from 'lucide-react';

const Landing: FC = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  
  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (publicKey) {
      navigate('/dashboard');
    }
  }, [publicKey, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 flex-grow flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                Event tickets with Solana ZK Compression
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Create events and mint compressed token tickets. Leverage Solana's scalability with ZK compression for efficient, secure event management.Built for 1000x Hackathon.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <WalletMultiButton className="!bg-gradient-to-r from-purple-500 to-blue-500 !rounded-lg !py-3 !px-6 !text-lg" />
              
              <a 
                href="#features"
                className="inline-flex items-center justify-center bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Key Features
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
              <div className="bg-purple-500/10 p-3 rounded-lg inline-block mb-4">
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Events</h3>
              <p className="text-gray-400">
                Easily create and manage events with customizable details and ticket quantities.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
              <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-4">
                <Ticket className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mint Tickets</h3>
              <p className="text-gray-400">
                Mint compressed tokens as tickets with ZK compression for maximum scalability.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
              <div className="bg-purple-500/10 p-3 rounded-lg inline-block mb-4">
                <QrCode className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">QR Code Claims</h3>
              <p className="text-gray-400">
                Generate QR codes for attendees to easily claim their event tickets.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
              <div className="bg-blue-500/10 p-3 rounded-lg inline-block mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Solana Security</h3>
              <p className="text-gray-400">
                Leverage Solana's security and speed with Light Protocol's ZK technology.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;