import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { AxiosError } from "axios";

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
      useLoginWithOAuth,
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
    onSuccess: () => {
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
    onSuccess: () => {
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

function useLoginWithOAuth(
  provider: string,
  data: {
    code: string;
    state: string;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => api.loginWithOAuth(provider, data),
    onSuccess: (response) => {
      const data = response.data;
      if (data.success) {
        localStorage.setItem("session", data.sessionId);
      }
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}
