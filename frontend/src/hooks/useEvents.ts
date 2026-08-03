import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../services/api';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getEvents,
    staleTime: 30000, // 30 seconds cache
    refetchInterval: 30000, // Auto refetch every 30s as specified
  });
};

export const useEventDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventDetail(id!),
    enabled: !!id && !isNaN(id),
    staleTime: 10000,
    refetchInterval: 15000, // Refresh availability periodically
  });
};
