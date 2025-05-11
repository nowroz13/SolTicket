import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const { publicKey } = useWallet();
  
  if (!publicKey) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default RequireAuth;