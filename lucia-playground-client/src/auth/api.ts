import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const session = localStorage.getItem("session");
  if (session) {
    config.headers["Authorization"] = `Bearer ${session}`;
  }
  return config;
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

export function requestPasswordReset({ email }: { email: string }) {
  return api.post("/auth/request-password-reset", { email });
}

export function passwordReset({
  password,
  token,
}: {
  password: string;
  token: string;
}) {
  return api.post("/auth/reset-password", { password, token });
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

export async function logout() {
  await api.post("/auth/logout");
  localStorage.removeItem("session");
}

export async function getUser() {
  const response = await api.get("/auth/user");
  return response.data;
}

export async function exchangeOAuthCodeForToken(data: { code: string }) {
  return api.post<
    { success: true; sessionId: string } | { success: false; message: string }
  >(`/auth/exchange-code`, data);
}
