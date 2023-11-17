import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { AxiosError } from "axios";

export function useAuth() {
  return {
    useLogin,
    useLogout,
    useSignUp,
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

function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.signUp,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getUsersQueryKey],
      });
    },
  });
}

function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.login,
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
      // queryClient.invalidateQueries({
      //   queryKey: [getUsersQueryKey],
      // });
    },
  });
}
