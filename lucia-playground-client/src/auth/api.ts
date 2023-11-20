import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function signUpWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return api.post("/auth/signup/email", { email, password });
}

export function loginWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return api.post("/auth/login/email", { email, password });
}

export function signUpWithUsername({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return api.post("/auth/signup/username", { username, password });
}

export function loginWithUsername({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return api.post("/auth/login/username", { username, password });
}

export function logout() {
  return api.post("/auth/logout");
}

export async function getUser() {
  const response = await api.get("/auth/user");
  return response.data;
}
