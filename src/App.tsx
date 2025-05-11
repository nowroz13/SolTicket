import { FC, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import the required CSS for wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

// Import pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import ClaimTicket from './pages/ClaimTicket';
import NotFound from './pages/NotFound';

// Import components
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';

const App: FC = () => {
  // Set up Solana network connection to devnet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Set up wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/create-event" element={
                <RequireAuth>
                  <CreateEvent />
                </RequireAuth>
              } />
              <Route path="/event/:id" element={
                <RequireAuth>
                  <EventDetails />
                </RequireAuth>
              } />
              <Route path="/claim/:eventId/:ticketId" element={<ClaimTicket />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="bottom-right" />
          </Layout>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;