import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Event } from '../types';
import { useEventStore } from '../store/eventStore';
import { mintTicketToAttendee } from '../utils/bubblegumTickets';

const ClaimTicket: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!eventId) return;
        await useEventStore.getState().fetchEvents();
        const events = useEventStore.getState().events;
        const found = events.find((e) => e.id === eventId);
        setEvent(found || null);
      } catch (err) {
        setError('Failed to fetch event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  const handleClaim = async () => {
    if (!publicKey || !eventId || !event) {
      toast.error('Please connect your wallet to claim the ticket.');
      return;
    }

    // Check if payment reference exists
    const referenceStr = localStorage.getItem(`reference-${eventId}`);
    if (!referenceStr) {
      setError('No payment reference found. Please scan the QR code and pay first.');
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      // Mint cNFT ticket using Bubblegum
      const signature = await mintTicketToAttendee(
        new PublicKey(event.merkleTree),
        publicKey,
        `${event.name} Ticket`,
        event.imageUrl
      );

      // Update event's minted tickets count
      await useEventStore.getState().fetchEvents();

      toast.success('Ticket claimed successfully! Check your wallet.');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to claim ticket. Please ensure payment is complete.');
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Event not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Claim Your Event NFT</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{event.name}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-medium">{new Date(event.date * 1000).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-medium">{event.location}</p>
            </div>
            <div>
              <p className="text-gray-600">Tickets Sold</p>
              <p className="font-medium">{event.mintedTickets} / {event.totalTickets}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Claim NFT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimTicket;