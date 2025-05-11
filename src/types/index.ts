// Event interface
export interface Event {
  id: string;
  name: string;
  date: number; // i64 timestamp
  location: string;
  description: string;
  totalTickets: number; // u64
  mintedTickets: number; // u64
  isActive: boolean;
  creator: string; // Pubkey as string
  imageUrl: string;
  ticketPrice: number; // Price in SOL
  merkleTree: string; // Merkle tree address for cNFTs
  tickets?: Ticket[];
}

// Ticket interface
export interface Ticket {
  id: string;
  eventId: string;
  owner: string; // Pubkey as string
  claimed: boolean;
  claimDate?: number; // i64 timestamp
}

// Claim interface
export interface Claim {
  id: string;
  ticketId: string;
  claimerWallet: string;
  transactionId: string;
  createdAt: string;
}

// Transaction status interface
export interface TransactionStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: string;
  updatedAt?: string;
}