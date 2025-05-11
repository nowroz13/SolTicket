import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { mintCompressedTicket, claimTicket } from '../utils/solanaUtils';
import { Ticket } from '../types';

interface TicketState {
  tickets: Ticket[];
  mintTicket: (eventId: string, creatorWallet: string) => Promise<Ticket>;
  getTicket: (ticketId: string) => Promise<Ticket | undefined>;
  claimTicket: (ticketId: string, claimerWallet: string) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  
  mintTicket: async (eventId: string, creatorWallet: string) => {
    try {
      const tokenAddress = await mintCompressedTicket(
        eventId,
        new PublicKey(creatorWallet)
      );
      
      const newTicket: Ticket = {
        id: tokenAddress,
        eventId,
        creatorWallet,
        compressedNFTAddress: tokenAddress,
        claimed: false,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        tickets: [...state.tickets, newTicket]
      }));
      
      return newTicket;
    } catch (error) {
      console.error('Error minting ticket:', error);
      throw error;
    }
  },
  
  getTicket: async (ticketId: string) => {
    // In a real implementation, you would fetch the token data from the chain
    return get().tickets.find(ticket => ticket.id === ticketId);
  },
  
  claimTicket: async (ticketId: string, claimerWallet: string) => {
    try {
      await claimTicket(ticketId, new PublicKey(claimerWallet));
      
      set(state => ({
        tickets: state.tickets.map(ticket =>
          ticket.id === ticketId
            ? {
                ...ticket,
                claimed: true,
                claimerWallet,
                claimedAt: new Date().toISOString(),
              }
            : ticket
        ),
      }));
    } catch (error) {
      console.error('Error claiming ticket:', error);
      throw error;
    }
  },
}));