import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function signUp({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return api.post("/auth/signup", { email, password });
}

export function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return api.post("/auth/login", { email, password });
}

export function logout() {
  return api.post("/auth/logout");
}

export async function getUser() {
  const response = await api.get("/auth/user");
  return response.data;
}
