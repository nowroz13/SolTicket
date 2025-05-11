import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createRpc, Rpc } from '@lightprotocol/stateless.js';
import { createMint } from '@lightprotocol/compressed-token';
import * as bs58 from 'bs58';
import { Event } from '../types';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { IDL } from '../idl/event_ticketing';
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { findReference, validateTransfer } from '@solana/pay';
import { BigNumber } from 'bignumber.js';

// Initialize RPC client
const rpc = createRpc(
  'https://api.devnet.solana.com',
  'https://api.devnet.solana.com',
  'https://api.devnet.solana.com'
);

// Program ID for the event management program
const EVENT_PROGRAM_ID = new PublicKey('4QrPtaAoz9ZBudP8M9ZVHy8ixN8AdGs9eYVh7MD77NUX');

export interface EventData {
  name: string;
  date: string;
  location: string;
  description: string;
  ticketsTotal: number;
  creatorWallet: string;
}

// Create a new event on-chain with cNFT
export const createEvent = async (eventData: Omit<Event, 'id' | 'tickets'>): Promise<string> => {
  try {
    if (!window.solana) {
      throw new Error('Solana wallet not found');
    }

    const eventAccount = Keypair.generate();
    const provider = new AnchorProvider(
      new Connection('https://api.devnet.solana.com'),
      window.solana,
      { commitment: 'confirmed' }
    );

    if (!provider.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);

    // Convert date string to timestamp
    const dateTimestamp = Math.floor(new Date(eventData.date).getTime() / 1000);

    // Create metadata for the cNFT
    const metadata = {
      name: eventData.name,
      symbol: 'EVT',
      image: eventData.imageUrl,
      description: eventData.description,
      attributes: [
        { traitType: 'Event Date', value: eventData.date.toString() },
        { traitType: 'Location', value: eventData.location },
        { traitType: 'Type', value: 'Event Ticket' }
      ]
    };

    console.log('Initializing event...');
    // Initialize the event with cNFT data
    const tx = await program.methods
      .initializeEvent(
        eventData.name,
        new BN(dateTimestamp),
        eventData.location,
        eventData.description,
        new BN(eventData.totalTickets),
        metadata
      )
      .accounts({
        event: eventAccount.publicKey,
        creator: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        mint: provider.wallet.publicKey, // Using creator's wallet as mint for now
        tokenPool: provider.wallet.publicKey // Using creator's wallet as token pool for now
      })
      .signers([eventAccount])
      .rpc();

    console.log('Event initialization transaction sent:', tx);
    const confirmation = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log('Event initialization confirmed:', confirmation);

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return eventAccount.publicKey.toString();
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof Error) {
      if ('logs' in error) {
        console.error('Transaction logs:', (error as any).logs);
      }
      if ('message' in error) {
        console.error('Error message:', error.message);
      }
    }
    throw new Error('Failed to create event on-chain');
  }
};

// Mint compressed experience tokens (cTokens)
export const mintCTokens = async (
  eventId: string,
  recipient: PublicKey,
  amount: number
): Promise<string> => {
  try {
    console.log('Starting cToken minting process...');
    console.log('Event ID:', eventId);
    console.log('Recipient:', recipient.toString());
    console.log('Amount:', amount);

    const provider = new AnchorProvider(
      new Connection('https://api.devnet.solana.com'),
      window.solana,
      { commitment: 'confirmed' }
    );

    console.log('Provider created with wallet:', provider.wallet.publicKey.toString());

    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);
    console.log('Program initialized with ID:', EVENT_PROGRAM_ID.toString());
    
    // Create a new ticket account
    const ticketAccount = Keypair.generate();
    console.log('Generated ticket account:', ticketAccount.publicKey.toString());
    
    // Mint the ticket (we'll use this as our cToken)
    console.log('Preparing mint transaction...');
    const tx = await program.methods
      .mintTicket()
      .accounts({
        event: new PublicKey(eventId),
        ticket: ticketAccount.publicKey,
        creator: provider.wallet.publicKey,
        recipient: recipient,
        systemProgram: SystemProgram.programId,
      })
      .signers([ticketAccount])
      .rpc();

    console.log('Transaction sent:', tx);
    await provider.connection.confirmTransaction(tx);
    console.log('Transaction confirmed');
    
    return ticketAccount.publicKey.toString();
  } catch (error) {
    console.error('Detailed error in mintCTokens:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to mint experience tokens: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Claim cTokens
export const claimCTokens = async (eventId: string, imageUrl: string): Promise<void> => {
  if (!window.solana) {
    throw new Error('Solana wallet not found');
  }

  try {
    const provider = new AnchorProvider(
      new Connection(process.env.REACT_APP_RPC_URL || 'https://api.devnet.solana.com'),
      window.solana,
      { commitment: 'confirmed' }
    );

    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);
    const event = new PublicKey(eventId);

    // Create a new cToken account
    const cTokenAccount = Keypair.generate();
    
    // Mint cToken with image URL
    const tx = await program.methods
      .mintTicket(imageUrl)
      .accounts({
        event,
        ticket: cTokenAccount.publicKey,
        recipient: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([cTokenAccount])
      .rpc();

    console.log('Transaction signature:', tx);
  } catch (error) {
    console.error('Error claiming cTokens:', error);
    throw error;
  }
};

// Fetch all events from the chain
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const provider = new AnchorProvider(
      new Connection('https://api.devnet.solana.com'),
      window.solana,
      { commitment: 'confirmed' }
    );

    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);

    // Fetch all event accounts
    const events = await program.account.event.all();
    
    return events.map(event => ({
      id: event.publicKey.toString(),
      name: event.account.name,
      date: event.account.date.toNumber(),
      location: event.account.location,
      description: event.account.description,
      totalTickets: event.account.totalTickets.toNumber(),
      mintedTickets: event.account.mintedTickets.toNumber(),
      isActive: event.account.isActive,
      creator: event.account.creator.toString(),
      imageUrl: event.account.imageUrl,
      ticketPrice: event.account.ticketPrice.toNumber()
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Generate QR code data for claiming
export const createClaimLink = (eventId: string, cTokenId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/claim/${eventId}/${cTokenId}`;
};

export const mintCompressedToken = async (
  eventId: string,
  recipient: string,
  imageUrl: string
): Promise<string> => {
  try {
    const connection = new Connection(process.env.REACT_APP_RPC_ENDPOINT || 'https://api.devnet.solana.com');
    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);

    // Create metadata for the compressed token
    const metadata = {
      name: `Event Token - ${eventId}`,
      symbol: 'EVT',
      image: imageUrl,
      description: 'Event experience token',
      attributes: [
        { trait_type: 'Event ID', value: eventId },
        { trait_type: 'Type', value: 'Experience Token' }
      ]
    };

    // Create the compressed token account
    const tokenAccount = Keypair.generate();

    // Mint the compressed token
    const tx = await program.methods
      .mintCompressedToken(metadata)
      .accounts({
        tokenAccount: tokenAccount.publicKey,
        recipient: new PublicKey(recipient),
        systemProgram: SystemProgram.programId,
      })
      .signers([tokenAccount])
      .rpc();

    // Update event's minted tokens count
    await updateEventMintedCount(eventId);

    return tokenAccount.publicKey.toString();
  } catch (error) {
    console.error('Error minting compressed token:', error);
    throw error;
  }
};

export const updateEventMintedCount = async (eventId: string): Promise<void> => {
  try {
    const connection = new Connection(process.env.REACT_APP_RPC_ENDPOINT || 'https://api.devnet.solana.com');
    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);

    // Get current event data
    const event = await program.account.event.fetch(new PublicKey(eventId));
    
    // Update minted count
    await program.methods
      .updateMintedCount(event.mintedTickets + 1)
      .accounts({
        event: new PublicKey(eventId),
        authority: provider.wallet.publicKey,
      })
      .rpc();
  } catch (error) {
    console.error('Error updating minted count:', error);
    throw error;
  }
};

export const verifyAndMintToken = async (
  eventId: string,
  recipient: string,
  reference: PublicKey,
  imageUrl: string
): Promise<void> => {
  try {
    const connection = new Connection(process.env.REACT_APP_RPC_ENDPOINT || 'https://api.devnet.solana.com');
    
    // Find the transaction
    const signatureInfo = await findReference(connection, reference);
    if (!signatureInfo) {
      throw new Error('Payment not found');
    }

    // Get event details
    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);
    const event = await program.account.event.fetch(new PublicKey(eventId));

    // Validate the transfer
    const transferValid = await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient: event.creator,
        amount: new BigNumber(event.ticketPrice),
        reference,
      }
    );

    if (!transferValid) {
      throw new Error('Invalid payment');
    }

    // Mint the compressed token
    await mintCompressedToken(eventId, recipient, imageUrl);
  } catch (error) {
    console.error('Error verifying and minting token:', error);
    throw error;
  }
};

// Transfer cNFT to buyer after payment
export const transferEventNFT = async (
  eventId: string,
  recipient: string,
  reference: PublicKey
): Promise<void> => {
  try {
    const connection = new Connection(process.env.REACT_APP_RPC_ENDPOINT || 'https://api.devnet.solana.com');
    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program(IDL, EVENT_PROGRAM_ID, provider);

    // Get event details
    const event = await program.account.event.fetch(new PublicKey(eventId));
    
    // Verify payment
    const signatureInfo = await findReference(connection, reference);
    if (!signatureInfo) {
      throw new Error('Payment not found');
    }

    const transferValid = await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient: event.creator,
        amount: new BigNumber(event.ticketPrice.toString()),
        reference,
      }
    );

    if (!transferValid) {
      throw new Error('Invalid payment');
    }

    // Create recipient's token account
    const recipientTokenAccount = Keypair.generate();

    // Transfer the cNFT
    const tx = await program.methods
      .transferEventNFT()
      .accounts({
        event: new PublicKey(eventId),
        recipient: new PublicKey(recipient),
        recipientTokenAccount: recipientTokenAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([recipientTokenAccount])
      .rpc();

    // Update event's minted tickets count
    await program.methods
      .updateMintedCount(new BN(event.mintedTickets.toNumber() + 1))
      .accounts({
        event: new PublicKey(eventId),
        authority: provider.wallet.publicKey,
      })
      .rpc();

    await provider.connection.confirmTransaction(tx);
  } catch (error) {
    console.error('Error transferring event NFT:', error);
    throw error;
  }
};