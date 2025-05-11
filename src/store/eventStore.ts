import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { createEvent, fetchEvents } from '../utils/solanaUtils';
import { Event } from '../types';

interface EventState {
  events: Event[];
  fetchEvents: () => Promise<void>;
  createEvent: (eventData: Omit<Event, 'id' | 'tickets'>) => Promise<string>;
  getEvent: (id: string) => Promise<Event | undefined>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  
  fetchEvents: async () => {
    try {
      const onChainEvents = await fetchEvents();
      set({ events: onChainEvents });
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  createEvent: async (eventData) => {
    try {
      const eventId = await createEvent(eventData);
      
      // Fetch updated events list
      await get().fetchEvents();
      
      return eventId;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  getEvent: async (id: string) => {
    try {
      // Fetch fresh data from chain
      await get().fetchEvents();
      return get().events.find(event => event.id === id);
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  },
}));