import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEventStore } from '../store/eventStore';
import { Event } from '../types';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { fetchEvents } = useEventStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      if (!publicKey) return;

      try {
        setIsLoading(true);
        await fetchEvents();
        const storeEvents = useEventStore.getState().events;
        setEvents(storeEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [publicKey, fetchEvents]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Please connect your wallet</h1>
        <p className="text-gray-400">Connect your wallet to view and manage events</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Your Events
          </span>
        </h1>
        <button
          onClick={() => navigate('/create-event')}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Create Event
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size={32} className="animate-spin text-purple-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No events found</p>
          <button
            onClick={() => navigate('/create-event')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">{event.name}</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Calendar size={18} className="mr-2 text-purple-400" />
                  <span>{new Date(event.date * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin size={18} className="mr-2 text-purple-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users size={18} className="mr-2 text-purple-400" />
                  <span>{event.mintedTickets} / {event.totalTickets} tickets</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;