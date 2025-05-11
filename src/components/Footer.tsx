import { FC } from 'react';
import { Github as GitHub, Mail, Twitter } from 'lucide-react';

const Footer: FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">
              SolTicket - Event Ticketing with ZK Compression
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Powered by Solana, Light Protocol & Helius
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <GitHub size={20} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a 
              href="mailto:info@solticket.com" 
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;