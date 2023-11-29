import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { AxiosError, AxiosResponse } from "axios";

export function useAuth() {
  return {
    email: {
      useSignUp: useEmailSignUp,
      useLogin: useEmailLogin,
      useRequestPasswordReset,
      usePasswordReset,
    },
    username: {
      useSignUp: useUsernameSignUp,
      useLogin: useUsernameLogin,
    },
    oauth: {
      useExchangeCodeForToken: useExchangeOAuthCodeForToken,
    },
    useLogout,
    useGetUser,
  };
}

const getUsersQueryKey = "users";

function useGetUser() {
  return useQuery({
    queryKey: [getUsersQueryKey],
    queryFn: api.getUser,
    retry(failureCount, error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

function useEmailSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.signUpWithEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function useEmailLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.loginWithEmail,
    onSuccess: (response) => {
      setSessionIfExists(response);
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function useRequestPasswordReset() {
  return useMutation({
    mutationFn: api.requestPasswordReset,
  });
}

function usePasswordReset() {
  return useMutation({
    mutationFn: api.passwordReset,
  });
}

function useUsernameSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.signUpWithUsername,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function useUsernameLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.loginWithUsername,
    onSuccess: (response) => {
      setSessionIfExists(response);
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function useExchangeOAuthCodeForToken(data: { code: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => api.exchangeOAuthCodeForToken(data),
    onSuccess: (response) => {
      setSessionIfExists(response);
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function setSessionIfExists(
  response: AxiosResponse<
    { success: true; sessionId: string } | { success: false }
  >
) {
  const data = response.data;
  if (data.success) {
    localStorage.setItem("session", data.sessionId);
  }
}
