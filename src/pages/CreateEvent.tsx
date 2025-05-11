import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createEvent } from '../utils/solanaUtils';
import { Event } from '../types';
import { Loader, Calendar, MapPin, Users, FileText, Ticket, Upload } from 'lucide-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { encodeURL, createQR } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { createEventTree } from '../utils/bubblegumTickets';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<any>(null);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    totalTickets: 0,
    ticketPrice: 0,
    imageUrl: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // Create Merkle tree for the event
      const { treeAddress, signature: treeSignature } = await createEventTree();

      const eventData: Omit<Event, 'id' | 'tickets'> = {
        name: formData.name,
        date: new Date(formData.date).getTime() / 1000, // Convert to Unix timestamp
        location: formData.location,
        description: formData.description,
        totalTickets: formData.totalTickets,
        ticketPrice: formData.ticketPrice,
        imageUrl: formData.imageUrl,
        creator: publicKey.toString(),
        mintedTickets: 0,
        isActive: true,
        merkleTree: treeAddress.toString(), // Store the Merkle tree address
      };

      const eventId = await createEvent(eventData);
      setCreatedEventId(eventId);

      // Create Solana Pay URL
      const reference = Keypair.generate().publicKey;

      // Create the payment request URL
      const url = encodeURL({
        recipient: publicKey,
        amount: new BigNumber(formData.ticketPrice), // Amount in SOL
        reference,
        label: formData.name,
        message: `Purchase ticket for ${formData.name}`,
        memo: eventId
      });

      // Create QR code
      const qr = createQR(url);
      setQrCode(qr);
      
      toast.success('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add useEffect to render QR code
  React.useEffect(() => {
    if (qrCode) {
      const element = document.getElementById('qr-code');
      if (element) {
        // Clear any existing QR code
        element.innerHTML = '';
        // Append the new QR code
        qrCode.append(element);
      }
    }
  }, [qrCode]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Please connect your wallet</h1>
        <p className="text-gray-400">Connect your wallet to create an event</p>
        <button
          onClick={() => connect()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (createdEventId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <h1 className="text-3xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Event Created Successfully!
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Calendar size={20} className="mr-2 text-purple-400" />
                <span>{new Date(formData.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <MapPin size={20} className="mr-2 text-purple-400" />
                <span>{formData.location}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <Users size={20} className="mr-2 text-purple-400" />
                <span>{formData.totalTickets} tickets available</span>
              </div>

              <div className="flex items-center text-gray-300">
                <Ticket size={20} className="mr-2 text-purple-400" />
                <span>{formData.ticketPrice} SOL per ticket</span>
              </div>

              <div className="flex items-center text-gray-300">
                <FileText size={20} className="mr-2 text-purple-400" />
                <span>{formData.description}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-300 mb-4">Share with Your Audience</h3>
              <div className="bg-white p-4 rounded-lg" id="qr-code">
                {/* The QR code will be rendered here by Solana Pay */}
              </div>
              <p className="mt-4 text-sm text-gray-400 text-center">
                Share this QR code with your audience. They can scan it to purchase tickets using their Solana wallet.
                The payment will be processed through Solana Pay.
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full mt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 w-full"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/event/${createdEventId}`)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 w-full"
                >
                  View Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Create New Event
          </span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Total Tickets</label>
            <input
              type="number"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Price (SOL)</label>
            <input
              type="number"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg font-medium ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Event...
              </span>
            ) : (
              'Create Event'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;