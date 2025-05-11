import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEventStore } from '../store/eventStore';
import { Calendar, MapPin, Users, FileText, Ticket } from 'lucide-react';
import { PublicKey, Keypair, Connection } from '@solana/web3.js';
import { encodeURL, createQR, findReference, FindReferenceError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { toast } from 'react-hot-toast';
import { transferEventNFT } from '../utils/solanaUtils';

const EventDetails: FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [qrCode, setQrCode] = useState<any>(null);
  const [reference, setReference] = useState<PublicKey | null>(null);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  useEffect(() => {
    const loadEventDetails = async () => {
      if (!eventId) return;
      try {
        await useEventStore.getState().fetchEvents();
        const events = useEventStore.getState().events;
        const event = events.find((e) => e.id === eventId);
        if (event) {
          setEventDetails(event);
          // Generate Solana Pay transaction request URL for cNFT mint
          const apiUrl = new URL('http://localhost:4000/api/tx');
          apiUrl.searchParams.set('eventId', eventId);
          apiUrl.searchParams.set('imageUrl', event.imageUrl);
          apiUrl.searchParams.set('eventName', event.name);
          apiUrl.searchParams.set('eventDescription', event.description);
          // The wallet will append ?account=<userPublicKey> when requesting the transaction
          const solanaPayUrl = `solana:${apiUrl.toString()}`;
          const qr = createQR(solanaPayUrl);
          setQrCode(qr);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    loadEventDetails();
  }, [eventId]);

  // Render QR code
  useEffect(() => {
    if (qrCode) {
      const element = document.getElementById('qr-code');
      if (element) {
        element.innerHTML = '';
        qrCode.append(element);
      }
    }
  }, [qrCode]);

  // Poll for payment and mint cNFT
  useEffect(() => {
    if (!reference || !publicKey || !eventDetails || minted) return;
    let interval: NodeJS.Timeout;
    const connection = new Connection('https://api.devnet.solana.com');
    interval = setInterval(async () => {
      try {
        const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
        if (signatureInfo) {
          setMinting(true);
          // Call backend to mint cNFT
          const res = await fetch('http://localhost:4000/api/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payer: publicKey.toString(),
              reference: reference.toString(),
              eventId,
              imageUrl: eventDetails.imageUrl,
              eventName: eventDetails.name,
              eventDescription: eventDetails.description,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setMinted(true);
            toast.success('NFT claimed successfully! Check your wallet.');
          } else {
            toast.error('Minting failed: ' + data.error);
          }
          setMinting(false);
          clearInterval(interval);
        }
      } catch (e) {
        if (!(e instanceof FindReferenceError)) {
          console.error('Error finding reference:', e);
        }
        // else: not found yet, keep polling
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [reference, publicKey, eventDetails, eventId, minted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg">Go to Dashboard</button>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <p className="text-lg font-semibold">Event not found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{eventDetails.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(eventDetails.date * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{eventDetails.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{eventDetails.mintedTickets} / {eventDetails.totalTickets} tickets minted</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Ticket className="h-5 w-5 mr-2" />
                  <span>{eventDetails.ticketPrice} SOL per ticket</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FileText className="h-5 w-5 mr-2" />
                  <span>{eventDetails.description}</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Purchase Ticket</h3>
                <div className="bg-white p-4 rounded-lg" id="qr-code">
                  {/* QR code will be rendered here */}
                </div>
                {minting && <p className="text-purple-600 font-semibold">Minting your NFT...</p>}
                {minted && <p className="text-green-600 font-semibold">NFT claimed! Check your wallet.</p>}
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with your Solana wallet to purchase a ticket.<br />
                  The ticket will be automatically minted to your wallet after payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;