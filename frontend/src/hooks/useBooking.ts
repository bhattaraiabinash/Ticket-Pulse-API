import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export const useBooking = () => {
  const queryClient = useQueryClient();
  const setCurrentBooking = useStore((state) => state.setCurrentBooking);

  const createBookingMutation = useMutation({
    mutationFn: ({ eventId, ticketIds }: { eventId: number; ticketIds: number[] }) =>
      bookingsApi.createBooking(eventId, ticketIds),
    onSuccess: (data) => {
      setCurrentBooking(data);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Seats reserved! Complete your booking within 10 minutes.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const confirmBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.confirmBooking(bookingId),
    onSuccess: (data) => {
      setCurrentBooking(data);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Booking confirmed successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
    confirmBooking: confirmBookingMutation.mutateAsync,
    isConfirming: confirmBookingMutation.isPending,
  };
};

export const useBookingDetail = (bookingId: number | null) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.getBookingDetail(bookingId!),
    enabled: !!bookingId && !isNaN(bookingId),
  });
};
