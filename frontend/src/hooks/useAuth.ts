import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, getErrorMessage } from '../services/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearStoreUser } = useStore();

  // Fetch current user on init
  const { data: meUser, isLoading: isCheckingAuth } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 60000,
  });

  useEffect(() => {
    if (meUser) {
      setUser(meUser);
    }
  }, [meUser, setUser]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.setQueryData(['me'], userData);
      toast.success(`Welcome back, ${userData.username}!`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.setQueryData(['me'], userData);
      toast.success('Account created successfully! Welcome to TicketPulse.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearStoreUser();
      queryClient.removeQueries({ queryKey: ['me'] });
      toast.success('Logged out successfully');
    },
    onError: () => {
      clearStoreUser();
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isCheckingAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
