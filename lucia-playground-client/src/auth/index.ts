import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { AxiosError } from "axios";

export function useAuth() {
  return {
    email: {
      useSignUp: useEmailSignUp,
      useLogin: useEmailLogin,
    },
    username: {
      useSignUp: useUsernameSignUp,
      useLogin: useUsernameLogin,
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
