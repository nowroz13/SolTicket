import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  const { id, name, date, location, description, ticketsTotal, ticketsMinted } = event;

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-xl">
      <div className="h-40 bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center">
        <h3 className="text-2xl font-bold text-white px-4 text-center">
          {name}
        </h3>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <Calendar size={16} className="mr-2 text-purple-400" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <MapPin size={16} className="mr-2 text-purple-400" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Users size={16} className="mr-2 text-purple-400" />
            <span>
              {ticketsMinted} / {ticketsTotal} tickets minted
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 mb-6 line-clamp-2">{description}</p>
        
        <Link 
          to={`/event/${id}`}
          className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
        >
          <span>View Details</span>
          <ExternalLink size={16} className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;